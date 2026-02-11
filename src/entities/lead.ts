import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, DeleteDateColumn } from 'typeorm';
import { IsString, IsEmail, IsNotEmpty, IsInt } from 'class-validator';
import { Activity } from './activities';


export enum LeadRole {
  ADMIN = "admin",
  ADVISOR = "advisor",
}

export enum Source {
  LANDING = "landing",
  WHATSAPP = "whatsapp",
  REFERRED = "referred"
}

export enum Stage {
  NEW = "new",
  CONTACTED = "contacted",
  PROPOSAL = "proposal",
  WON = "won",
  LOST = "lost"
}


@Entity({ name: "lead"})
export class Lead {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @IsString()
  @IsNotEmpty()
  fullname!: string;

  @Column({ unique: true, type: "varchar", length: 13 })
  phone!: string;

  @Column({ nullable: true})
  @IsEmail()
  email!: string;

  @Column({ nullable: true, enum: Source })
  source!: string;

  @Column({ nullable: true, enum: Stage })
  stage!: string;

  @Column({ nullable: true })
  @IsInt()
  assignedTo!: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;

  @Column({ default: LeadRole.ADVISOR, enum: LeadRole })
  role!: string
  
  @OneToMany(() => Activity, activity => activity.lead)
  activities: Activity[];

   @DeleteDateColumn()
   deletedAt: Date;
}   