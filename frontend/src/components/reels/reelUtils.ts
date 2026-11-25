import type { Reel } from '../../types';

export function buildReelCaptionsDataUri(reel: Reel): string {
  const cleanTitle = reel.title.replace(/\r?\n/g, ' ');
  const cleanCaption = reel.caption.replace(/\r?\n/g, ' ');
  const cleanTakeaway = reel.key_takeaway.replace(/\r?\n/g, ' ');
  const vtt = [
    'WEBVTT',
    '',
    '00:00.000 --> 00:05.000',
    `${cleanTitle}`,
    '',
    '00:05.000 --> 00:12.000',
    `${cleanCaption}`,
    '',
    '00:12.000 --> 00:30.000',
    `Key Takeaway: ${cleanTakeaway}`,
  ].join('\n');
  return `data:text/vtt;charset=utf-8,${encodeURIComponent(vtt)}`;
}
