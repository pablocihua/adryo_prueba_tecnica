import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'history'})
export class History {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'text' })
    log: string

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    createdAt: Date

    @Column()
    createdBy: number
}