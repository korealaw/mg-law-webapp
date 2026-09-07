#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const args = process.argv.slice(2);
const sourceArg = args.find((arg) => !arg.startsWith('--'));
const expectedVersion = args.find((arg) => arg.startsWith('--expected-version='))?.split('=')[1] || '';

if (!sourceArg) {
  console.error('사용법: node tools/qa-private-backend.mjs /path/to/Code.gs [--expected-version=8.4]');
  process.exit(2);
}

const sourcePath = path.resolve(process.cwd(), sourceArg);
const source = fs.readFileSync(sourcePath, 'utf8');
const passes = [];
const failures = [];

function check(ok, label, detail = '') {
  const suffix = detail ? ` — ${detail}` : '';
  if (ok) passes.push(`${label}${suffix}`);
  else failures.push(`${label}${suffix}`);
}

function extractConstExpression(name, opener, closer) {
  const marker = `const ${name}`;
  const markerAt = source.indexOf(marker);
  if (markerAt < 0) throw new Error(`${name} 선언을 찾지 못했습니다.`);
  const start = source.indexOf(opener, markerAt + marker.length);
  if (start < 0) throw new Error(`${name} 시작 문자를 찾지 못했습니다.`);

  let depth = 0;
  let quote = '';
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  for (let i = start; i < source.length; i += 1) {
    const ch = source[i];
    const next = source[i + 1];
    if (lineComment) {
      if (ch === '\n') lineComment = false;
      continue;
    }
    if (blockComment) {
      if (ch === '*' && next === '/') {
        blockComment = false;
        i += 1;
      }
      continue;
    }
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === quote) quote = '';
      continue;
    }
    if (ch === '/' && next === '/') {
      lineComment = true;
      i += 1;
      continue;
    }
    if (ch === '/' && next === '*') {
      blockComment = true;
      i += 1;
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

function readConst(name, opener, closer) {
  const expression = extractConstExpression(name, opener, closer);
  return vm.runInNewContext(`(${expression})`, Object.create(null), { timeout: 3000 });
}

let buildInfo;
let bank;
try {
  buildInfo = readConst('BUILD_INFO', '{', '}');
  bank = readConst('PROTECTED_QUESTION_BANK', '[', ']');
} catch (error) {
  console.error(`FAIL  Code.gs 구조 읽기 — ${error.message}`);
  process.exit(1);
}

const version = String(buildInfo.VERSION || '');
const required = Number(buildInfo.BASE_REQUIRED || 100);
const releasedBase = bank.filter((item) => item && item.release === true && String(item.tier || 'BASE').toUpperCase() === 'BASE');
const ids = releasedBase.map((item) => String(item.id || ''));
const expectedIds = Array.from({ length: required }, (_, i) => `B${String(i + 1).padStart(3, '0')}`);
const firstMismatch = expectedIds.findIndex((id, i) => ids[i] !== id);

check(Boolean(version), 'BUILD_INFO.VERSION 존재', version || '-');
if (expectedVersion) check(version === expectedVersion, '요구 버전 일치', `actual=${version}, expected=${expectedVersion}`);
check(required === 100, 'BASE_REQUIRED', String(required));
check(releasedBase.length === required, '공개대상 BASE 수량', `${releasedBase.length}/${required}`);
check(new Set(ids).size === ids.length, 'BASE ID 고유성', `${new Set(ids).size}/${ids.length}`);
check(firstMismatch === -1, 'B001~B100 반환 순서', firstMismatch === -1 ? `${ids[0] ?? '-'}~${ids.at(-1) ?? '-'}` : `위치 ${firstMismatch + 1}: actual=${ids[firstMismatch] ?? '누락'}, expected=${expectedIds[firstMismatch]}`);
check(releasedBase.every((item) => Array.isArray(item.options) && item.options.length === 4), 'BASE 선택지 4개');
check(releasedBase.every((item) => Number.isInteger(item.answer) && item.answer >= 0 && item.answer <= 3), 'BASE 정답 인덱스 0~3');
check(releasedBase.every((item) => typeof item.question === 'string' && item.question.trim()), 'BASE 질문문장 존재');
check(releasedBase.every((item) => typeof item.step1 === 'string' && item.step1.trim()), 'BASE 1단계 해설 존재');
check(releasedBase.every((item) => typeof item.step2 === 'string' && item.step2.trim()), 'BASE 2단계 해설 존재');
check(releasedBase.every((item) => Array.isArray(item.sources) && item.sources.length > 0), 'BASE 법령·해설 근거 존재');
check(new Set(releasedBase.map((item) => item.question.replace(/<[^>]+>/g, '').trim())).size === releasedBase.length, 'BASE 질문문장 고유성');
check(/function\s+protectedQuestions_\s*\(/.test(source), 'protectedQuestions_ 반환함수 존재');
check(/function\s+contentQuestionsResponse_\s*\(/.test(source), 'questions API 응답함수 존재');
check(/p\.action\s*===\s*['"]health['"]/.test(source), 'health endpoint 존재');
check(/p\.action\s*===\s*['"]questions['"]/.test(source), 'questions endpoint 존재');

for (const item of passes) console.log(`PASS  ${item}`);
for (const item of failures) console.error(`FAIL  ${item}`);
console.log(`\n버전 ${version || '-'} · 총 ${passes.length + failures.length}개 검사: PASS ${passes.length}, FAIL ${failures.length}`);
if (failures.length) process.exitCode = 1;
