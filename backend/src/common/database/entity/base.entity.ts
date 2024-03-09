import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

export class AppBaseEntity {
  @CreateDateColumn({ type: 'timestamp', select: false })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', select: false })
  updatedAt: Date;
}
