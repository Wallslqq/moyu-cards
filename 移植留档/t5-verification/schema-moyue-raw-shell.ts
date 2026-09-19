// 反向验证版：墨月原形态（registerMvuSchema 外壳 + CDN import + $() 注册）
// 预期：forge checkSchemaTsContent 预检拦截 import，validate-mvu 报错退出
import { registerMvuSchema } from 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/util/mvu_zod.js';

export const Schema = z.object({
  主角: z.object({
    姓名: z.string(),
    体力: z.coerce.number(),
    是否觉醒: z.boolean(),
    状态: z.enum(['正常', '受伤', '昏迷']),
  }),
});

$(() => {
  registerMvuSchema(Schema);
});
