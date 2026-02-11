import { FindManyOptions } from "typeorm";

import { AppDataSource } from "../data-source";
import { Lead } from "../entities/lead";

const leadRepository = AppDataSource.getRepository(Lead);

const saveLead = async ( lead: any ) => {
    return await leadRepository.save(
        leadRepository.create( lead )
    );
}

const getLeadByFilters = async ( filters: FindManyOptions) => {
    const leads = await leadRepository.find( filters );

    return leads;
}

const getLeadByOne = async ( filters: any ) => {
    return await leadRepository.findOne(
        filters
    );
}

const updateLead = async ( filter: any, load: any ) => {
    return await leadRepository.update(
        filter, load
    );
}

const deleteLead = async ( filter: any ) => {
    return await leadRepository.softDelete(
        filter
    );
}

const totalLeads = async ( filters: any  = {}) => {
    return await leadRepository.findAndCount( filters );
}

const queryMetricsCountAndGroupBy = async ( promts: any ) => {
    const { field, limit, range } = promts;

    const metrics = leadRepository.createQueryBuilder('l')
        .select(`l."${field}"`)
        .addSelect(`COUNT(l."${field}")`, `total`);

        if( range && Object.keys( range) && Object.values(range) ){
            const { from, to } = range;
            metrics.where('l.createdAt BETWEEN :startDate AND :endDate', {
                startDate: new Date( from ),
                endDate: new Date( to )
            });
        }

        metrics.groupBy(`l."${field}"`)
            .orderBy(`total`, 'DESC');

        if( limit && limit > 0 )
            metrics.limit( limit );

        return await metrics.getRawMany();
}

export {
    saveLead,
    getLeadByFilters,
    getLeadByOne,
    updateLead,
    deleteLead,
    queryMetricsCountAndGroupBy,
    totalLeads,
}