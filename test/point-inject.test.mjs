import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildPointInjection, POINT_INJECT_KEY } from '../business/point/injection.js';

const index = readFileSync(new URL('../index.js', import.meta.url), 'utf8');
const bundle = readFileSync(new URL('../gouhua-app.js', import.meta.url), 'utf8');

const raw = `<calendar_widget>
StartDate: 2025-03-01
Day: 1|晴|12°C
Event: user|早餐|楼下买豆浆|08:00|便利店|老板记得她的口味
Day: 2|雨|9°C
Event: user|加班|被老板留下改方案|20:00|公司|
</calendar_widget>`;

test('point injection lists days, owners and the soft wording', () => {
    const text = buildPointInjection([{ view: 'user', charName: '', raw }, { view: 'char', charName: '伊戈尔', raw: '' }], '彤宝');
    assert.match(text, /^<point_reference>/);
    assert.match(text, /不必按顺序或逐条执行/);
    assert.match(text, /和「线」里的暗流结合/);
    assert.match(text, /彤宝的日程（第1天是 2025-03-01）：/);
    assert.match(text, /- 第1天 08:00：早餐——楼下买豆浆（便利店）｜线头：老板记得她的口味/);
    assert.match(text, /- 第2天 20:00：加班——被老板留下改方案（公司）\n/);
    assert.doesNotMatch(text, /伊戈尔的日程/);
    assert.equal(buildPointInjection([], '彤宝'), '');
});

test('point injection is wired, switchable and shipped in the bundle', () => {
    assert.match(index, /getSettings\(\)\.pointInject !== false/);
    assert.match(index, /refreshStoryClockInjection\(\);\n\s+refreshPointInjection\(\);/);
    assert.match(index, /setExtensionPrompt\?\.\(POINT_INJECT_KEY, ''\)/);
    assert.match(bundle, new RegExp(POINT_INJECT_KEY));
    assert.match(bundle, /point_reference/);
});
