import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { numberedSpacePointGroups } from '../business/space/context.js';

const index = readFileSync(new URL('../index.js', import.meta.url), 'utf8');
const bundle = readFileSync(new URL('../gouhua-app.js', import.meta.url), 'utf8');

test('lines snapshot captures point plan and lines api asks for it', () => {
    assert.match(index, /snapshot\.pointPlan = buildLinesPointPlan\(ctx\);/);
    assert.match(index, /includeOutlinePlan: true, includePointPlan: true/);
    assert.match(index, /const pointPlan = opts\.includePointPlan \? String\(ctx\.pointPlan \|\| ''\) : '';/);
    assert.match(index, /outlinePlan,\n\s+pointPlan,\n\s+\]\.filter\(Boolean\)/);
});

test('point plan respects the linesReadPoints switch and ships in the bundle', () => {
    assert.match(index, /if \(getSettings\(\)\.linesReadPoints === false\) return '';/);
    assert.match(bundle, /linesReadPoints/);
    assert.match(bundle, /已排日程（点）/);
});

test('point groups are numbered per owner', () => {
    const text = numberedSpacePointGroups(
        [{ view: 'user', charName: '', raw: 'x' }, { view: 'char', charName: '伊戈尔', raw: 'y' }],
        raw => (raw === 'x' ? '#1 【用户线】 早餐' : '#1 【角色线】 排班'),
        '彤宝',
    );
    assert.match(text, /【我｜人物：彤宝｜view="user"】\n#1 【用户线】 早餐/);
    assert.match(text, /【TA｜人物：伊戈尔｜view="char" char="伊戈尔"】\n#1 【角色线】 排班/);
});
