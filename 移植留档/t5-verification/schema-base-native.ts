// tavern 原生朴素写法（增补前基线）：无 prefault 链、无 transform
export const Schema = z.object({
  主角: z.object({
    姓名: z.string(),
    体力: z.coerce.number(),
    是否觉醒: z.boolean(),
    状态: z.enum(['正常', '受伤', '昏迷']),
  }),
  装备栏: z.partialRecord(z.enum(['武器', '护甲']), z.object({
    名称: z.string(),
    耐久: z.coerce.number(),
  })),
  背包: z.record(z.string(), z.object({
    数量: z.coerce.number(),
    描述: z.string(),
  })),
  _系统日志: z.array(z.string()),
});

export type Status = z.infer<typeof Schema>;
