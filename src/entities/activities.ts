import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Lead } from "./lead";

export enum Types {
    CALL = "call",
    WHATSAPP = "whatsapp",
    EMAIL = "email",
    VISIT = "visit",
    NOTE = "note",
}

@Entity({ name: "activity"})
export class Activity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({})
    leadId: number;

    @Column({ nullable: true, enum: Types })
    type: string;

    @Column()
    notes: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @ManyToOne(() => Lead, lead => lead.activities)
    lead: Lead;

    @DeleteDateColumn()
    deletedAt: Date;

    @Column({})
    createdBy: number;
}