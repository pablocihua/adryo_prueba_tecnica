import { FindManyOptions } from "typeorm";

import { AppDataSource } from "../data-source";
import { History } from "../entities/history";

const historyRepository = AppDataSource.getRepository(History);

export const saveHistory = async ( history: any ) => {
    return await historyRepository.save(
        historyRepository.create( history )
    );
}