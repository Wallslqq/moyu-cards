// 墨月过滤后写法：prefault 缺失补全链 + clamp transform + 空集合保持完整类型
// （已剔除 registerMvuSchema 外壳 / jsdelivr import / $(...) 注册 —— 由 forge 从 state.zod.importUrl 自动追加）
export const Schema = z.object({
  主角: z.object({
    姓名: z.string().prefault('无名'),
    体力: z.coerce.number().prefault(80),
    是否觉醒: z.boolean().prefault(false),
    状态: z.enum(['正常', '受伤', '昏迷']).prefault('正常'),
  }).prefault({}),
  装备栏: z.partialRecord(z.enum(['武器', '护甲']), z.object({
    名称: z.string(),
    耐久: z.coerce.number(),
  })).prefault({}),
  背包: z.record(z.string(), z.object({
    数量: z.coerce.number(),
    描述: z.string(),
  })).prefault({}),
  _系统日志: z.array(z.string()).prefault([]),
}).transform((data) => ({
  ...data,
  主角: { ...data.主角, 体力: _.clamp(data.主角.体力, 0, 100) },
}));

export type Status = z.infer<typeof Schema>;
