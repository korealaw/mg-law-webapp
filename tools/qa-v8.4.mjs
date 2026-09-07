#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const rootHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const extraHtml = fs.readFileSync(path.join(root, 'extra', 'index.html'), 'utf8');
const failures = [];
const passes = [];

function check(ok, label, detail = '') {
  const suffix = detail ? ` — ${detail}` : '';
  if (ok) passes.push(`${label}${suffix}`);
  else failures.push(`${label}${suffix}`);
}

function extractConstExpression(source, name, opener, closer) {
  const marker = `const ${name}`;
  const markerAt = source.indexOf(marker);
  if (markerAt < 0) throw new Error(`${name} 선언을 찾지 못했습니다.`);
  const start = source.indexOf(opener, markerAt + marker.length);
  if (start < 0) throw new Error(`${name} 시작 문자를 찾지 못했습니다.`);

  let depth = 0;
  let quote = '';
  let escaped = false;
  for (let i = start; i < source.length; i += 1) {
    const ch = source[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === quote) quote = '';
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      quote = ch;
      continue;
    }
    if (ch === opener) depth += 1;
    else if (ch === closer) {
      depth -= 1;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  throw new Error(`${name} 표현식이 닫히지 않았습니다.`);
}

function readConstArray(source, name) {
  const expression = extractConstExpression(source, name, '[', ']');
  return vm.runInNewContext(`(${expression})`, Object.create(null), { timeout: 1000 });
}

function inlineScripts(source) {
  return [...source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function auditQuestionSet(source, constName, prefix, expected) {
  const items = readConstArray(source, constName);
  const ids = items.map((item) => item.id);
  const expectedIds = Array.from({ length: expected }, (_, i) => `${prefix}${String(i + 1).padStart(2, '0')}`);
  check(items.length === expected, `${constName} 수량`, `${items.length}/${expected}`);
  check(new Set(ids).size === expected, `${constName} ID 고유성`, `${new Set(ids).size}/${expected}`);
  check(JSON.stringify(ids) === JSON.stringify(expectedIds), `${constName} ID 순서`, `${ids[0] ?? '-'}~${ids.at(-1) ?? '-'}`);
  check(items.every((item) => Array.isArray(item.options) && item.options.length === 4), `${constName} 선택지 4개`);
  check(items.every((item) => Number.isInteger(item.answer) && item.answer >= 0 && item.answer <= 3), `${constName} 정답 인덱스 0~3`);
  check(items.every((item) => typeof item.question === 'string' && item.question.trim()), `${constName} 질문문장 존재`);
  check(items.every((item) => typeof item.step1 === 'string' && item.step1.trim()), `${constName} 1단계 해설 존재`);
  check(items.every((item) => typeof item.step2 === 'string' && item.step2.trim()), `${constName} 2단계 해설 존재`);
  check(items.every((item) => Array.isArray(item.sources) && item.sources.length > 0), `${constName} 법령·해설 근거 존재`);
  return items;
}

for (const [label, source] of [['root', rootHtml], ['extra', extraHtml]]) {
  const scripts = inlineScripts(source);
  check(scripts.length === 2, `${label} inline script 수`, String(scripts.length));
  scripts.forEach((script, index) => {
    try {
      new vm.Script(script, { filename: `${label}:script-${index + 1}` });
      check(true, `${label} script ${index + 1} 구문`);
    } catch (error) {
      check(false, `${label} script ${index + 1} 구문`, error.message);
    }
  });
  check(!/\bB\d{3}\b/.test(source), `${label} 보호문항 ID 비노출`);
  check(!/\baccessDays\b|90일/.test(source), `${label} 90일 이용제한 제거`);
}

const study = auditQuestionSet(rootHtml, 'TRIAL_STUDY', 'L', 50);
const mock = auditQuestionSet(rootHtml, 'TRIAL_MOCK', 'M', 50);
const questions = [...study, ...mock].map((item) => item.question.replace(/<[^>]+>/g, '').trim());
check(new Set(questions).size === 100, '무료100 질문문장 완전 고유', `${new Set(questions).size}/100`);

const parts = readConstArray(rootHtml, 'BASE_PARTS');
check(parts.length === 12, 'BASE_PARTS 수량', `${parts.length}/12`);
check(parts[0]?.start === 1 && parts.at(-1)?.end === 100, 'BASE_PARTS 전체 범위', `${parts[0]?.start ?? '-'}~${parts.at(-1)?.end ?? '-'}`);
check(parts.every((part, i) => i === 0 || part.start === parts[i - 1].end + 1), 'BASE_PARTS 연속성');
check(parts.every((part) => part.start <= part.end), 'BASE_PARTS 역전 범위 없음');

const rootScripts = inlineScripts(rootHtml);
const extraScripts = inlineScripts(extraHtml);
check(rootScripts.length === extraScripts.length && rootScripts.every((script, i) => script === extraScripts[i]), 'root/extra 실행 코드 동일');
check(/<link rel="canonical" href="https:\/\/korealaw\.github\.io\/mg-law-webapp\/">/.test(rootHtml), 'root canonical URL');
check(/<link rel="canonical" href="https:\/\/korealaw\.github\.io\/mg-law-webapp\/extra\/">/.test(extraHtml), 'extra canonical URL');

const endpointPattern = /statusEndpoint:\s*['"]([^'"]+)['"]/;
const entryPattern = /surveyEntryId:\s*['"]([^'"]+)['"]/;
const rootEndpoint = rootHtml.match(endpointPattern)?.[1];
const extraEndpoint = extraHtml.match(endpointPattern)?.[1];
const rootEntry = rootHtml.match(entryPattern)?.[1];
const extraEntry = extraHtml.match(entryPattern)?.[1];
check(Boolean(rootEndpoint) && rootEndpoint === extraEndpoint, 'root/extra Apps Script endpoint 동일');
check(rootEntry === 'entry.310247277' && extraEntry === rootEntry, 'Google Form 인증코드 entry 동일');
check(rootHtml.includes("const FREE100_REGISTERED_KEY = 'mg_law_free100_registered_v84'"), 'v8.4 무료100 등록 키');
check(rootHtml.includes("function free100Completed(){ return !!(state.trial.studyCompleted && state.trial.mockCompleted); }"), '무료50+모의50 이중 완주 게이트');
check(rootHtml.includes("if(!free100Completed()) throw new Error('무료 100문항을 모두 완료한 뒤 진행해 주세요.');"), '완주 전 서버등록 차단');

const manifestPath = path.join(root, 'RELEASE_MANIFEST_v8.4.txt');
const manifest = fs.readFileSync(manifestPath, 'utf8').trim().split(/\r?\n/).filter(Boolean);
for (const line of manifest) {
  const match = line.match(/^([a-f0-9]{64})\s+(.+)$/);
  if (!match) {
    check(false, '릴리스 매니페스트 형식', line);
    continue;
  }
  const [, expectedHash, relative] = match;
  const target = path.join(root, relative);
  check(fs.existsSync(target) && sha256(target) === expectedHash, `매니페스트 ${relative}`);
}

for (const item of passes) console.log(`PASS  ${item}`);
for (const item of failures) console.error(`FAIL  ${item}`);
console.log(`\n총 ${passes.length + failures.length}개 검사: PASS ${passes.length}, FAIL ${failures.length}`);
if (failures.length) process.exitCode = 1;
