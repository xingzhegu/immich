import { authenticate } from '$lib/utils/auth';
import type { PageLoad } from './$types';

export const load = (async () => {
  await authenticate();
  return {
    meta: {
      title: '分享链接',
    },
  };
}) satisfies PageLoad;
