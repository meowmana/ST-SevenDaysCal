import { parseCalendar } from './parse.js';

export const POINT_INJECT_KEY = 'sp_point_latent';
export const POINT_INJECT_DEPTH = 4;

const eventLine = (label, ev, clean) => {
    const title = clean(String(ev?.title || '').trim());
    if (!title) return '';
    const desc = clean(String(ev?.desc || '').trim());
    const time = String(ev?.time || '').trim();
    const location = clean(String(ev?.location || '').trim());
    const hook = clean(String(ev?.npcAction || '').trim());
    return `- ${label}${time ? ` ${time}` : ''}：${title}${desc ? `——${desc}` : ''}${location ? `（${location}）` : ''}${hook ? `｜线头：${hook}` : ''}`;
};

export function buildPointInjection(scopes, userName = '用户', clean = value => value) {
    const groups = (Array.isArray(scopes) ? scopes : []).map(scope => {
        const cal = parseCalendar(String(scope?.raw || ''));
        const lines = [];
        for (const day of cal.days) for (const ev of day.events) lines.push(eventLine(`第${day.dayNumber}天`, ev, clean));
        for (const ev of cal.future?.events || []) lines.push(eventLine('之后', ev, clean));
        const kept = lines.filter(Boolean);
        if (!kept.length) return '';
        const who = scope?.view === 'char' ? (scope.charName || '角色') : userName;
        const start = cal.startDateToken && !cal.startDateToken.startsWith('null') ? `（第1天是 ${cal.startDateToken}）` : '';
        return `${who}的日程${start}：\n${kept.join('\n')}`;
    }).filter(Boolean);
    if (!groups.length) return '';
    return [
        '<point_reference>',
        '以下是构画「点」里排好的近期日程，只是素材，不是剧本：',
        '- 从中挑选与眼下剧情契合、时机合适的一两件，自然地织进来，可以和「线」里的暗流结合起来推进剧情；',
        '- 不必按顺序或逐条执行，不合时宜的直接忽略，时间和细节可以随剧情调整；',
        '- 不要复述日程原文，也不要让角色提起“日程”“计划表”。',
        '',
        groups.join('\n\n'),
        '</point_reference>',
    ].join('\n');
}
