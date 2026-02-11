import { FindManyOptions } from "typeorm";

import { AppDataSource } from "../data-source";
import { Activity } from "../entities/activities";

const activityRepository = AppDataSource.getRepository(Activity);

const saveActivity = async ( lead: any ) => {
    return await activityRepository.save(
        activityRepository.create( lead )
    );
}

const getActivityByFilters = async ( filters: FindManyOptions) => {
    const leads = await activityRepository.find( filters );

    return leads;
}

const getActivityByOne = async ( filters: any ) => {
    return await activityRepository.findOne(
        filters
    );
}

const updateActivity = async ( filter: any, load: any ) => {
    return await activityRepository.update(
        filter, load
    );
}

const deleteActivity = async ( filter: any ) => {
    return await activityRepository.softDelete(
        filter
    );
}

export { saveActivity, getActivityByFilters, getActivityByOne, updateActivity, deleteActivity }