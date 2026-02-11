import { Request, Response } from 'express';
import { FindManyOptions, In, Like } from 'typeorm';

import {
    saveLead, updateLead, getLeadByFilters, getLeadByOne, deleteLead,
    getActivityByFilters, saveActivity, updateActivity,
    saveHistory
} from '../repositories/index';

const save = async (
    req: Request,
    res: Response
): Promise< void > => {
    let status = 201;
    let response: any = {
        message: ""
    };
    const { user } = req;

    try {
        let {
            fullname, phone, email,
            source, stage, assignedTo
        } = req.body;

        if( !fullname || !phone ){
            status = 400;
            response.message = `Bad request,\n\rPhone or Fullname not completed`;
        } else {
            const newLead = await saveLead({
                fullname, phone, email,
                source, stage, assignedTo
            });
            response = {... {"lead": newLead}};
        }
        await saveHistory({
            log: JSON.stringify({
                file: 'controller.lead.save',
                case: 'post-try',
                message: response.message,
                operation: "Save a lead and validate if the user is an advisor to auto assign the lead"
            }),
            createdBy: user.id || 0
        });
    } catch ( error: any ){
        status = 500;
        response.message = `Internal Server` + `\n${error.message}`;
        if( error && error.message && error.message.includes('llave duplicada') ){
            status = 401;
            response.message = error.message;
        }
        await saveHistory({
            log: JSON.stringify({
                file: 'controller.lead.save',
                case: 'post-catch',
                message: error.message,
            }),
            createdBy: user.id || 0
        });
    }

    res.status( status ).json( response );
}

const getLeads = async (req: Request, res: Response): Promise<void> => {
    let status = 200;
    let response: any = {
        message: ""
    };
    const { user, query } = req;
    
    try {
        let leads: any[] = [];
        let filters: FindManyOptions = {};
        let where: any = {};
        let ordering: any = {};

        if( query ){
            const {
                stage, source, assignedTo,
                fullname, phone,
                createdAt, updatedAt,
            }: any = query;
            let { page, pageSize }: any = query;

            if( stage )
                where = { ...where, ...{ stage }};

            if( source )
                where = { ...where, ...{ source }};

            if( assignedTo )
                where = { ...where, ...{ assignedTo }};
            // Searching
            if( fullname )
                where = { ...where, ...{ fullname: Like(`%${fullname}%`) }};
            if( phone )
                where = { ...where, ...{ phone: Like(`%${phone}%`) }};
            // Order
            if( createdAt )
                ordering = { ...ordering, ...{ createdAt: parseInt(createdAt) ? 'DESC' : 'ASC'}}
            if( updatedAt )
                ordering = { ...ordering, ...{ updatedAt: parseInt(updatedAt) ? 'DESC' : 'ASC'}}
            // Paging
            if( pageSize && page ){
                page = parseInt( page );
                pageSize = parseInt( pageSize );
                let skip = (page -1) * pageSize;
                filters = { ...filters, ...{ take: pageSize, skip }}
            }
        }

        if( user && user.role.toLowerCase() !== 'admin'){
            where = { ...where, ...{ assignedTo: user.id }}
        }
        if( where && Object.keys( where ).length )
            filters = { ...filters, ...{ where }};
        if( ordering && Object.values( ordering ).length )
            filters = { ...filters, ...{ order: ordering }}

        /* filters = { ...filters,
            ... { select: {
                id: true,
                deletedAt: false,
            }}
        }; */

        leads = await getLeadByFilters( filters );

        if( leads && leads.length )
            response = { ...response, ...{ leads }};
        else
            response = { ...response, ...{ leads: [], message: "Leads not found"} };

    } catch( error: any ){
        status = 500
        response.message = `Internal Server. ${error.message}`
        await saveHistory({
            log: JSON.stringify({
                file: 'controller.lead.getLeads',
                case: 'get-catch',
                message: error.message,
            }),
            createdBy: user.id || 0
        });
    }

    res.status( status ).json( response );
}

const getLead = async (req: Request, res: Response): Promise<void> => {
    let status = 200;
    let response: any = {};
    const { user } = req;

    try {
        if( req.params && req.params.leadId){
            let { leadId } = req.params;
            // const leads = await leadRepository.findOne({
            const leads = await getLeadByOne({
                where: {
                        id: In([leadId])
                }
            });

            response = { ... { leads }};
            if( !leads ) response = { ... {leads: {}, message: "Lead not found"} };
        }

    } catch( error: any ){
        status = 500
        response.message = `Internal Server. ${error.message}`
        await saveHistory({
            log: JSON.stringify({
                file: 'controller.lead.getLeas',
                case: 'get.catch',
                message: error.message,
            }),
            createdBy: user.id || 0
        });
    }

    res.status( status ).json( response );
}

const updateLeadBy = async (req: Request, res: Response ): Promise<void> => {
    let status = 200;
    let response: any = {};
    const { params, body, method, user } = req;

    try {
        let completed: boolean = false;
        let theReason: string = '';
        let hasActivities: boolean = false;

        if( method.toLocaleLowerCase() === 'post'){
            const { leadId } = params;
            let { stage, reason } = body;
            let dbStage: any = '';

            if( stage.toLocaleLowerCase() === 'won'){
                const activities = await getActivityByFilters({
                    where: {
                        leadId: In([leadId])
                    }
                });
                if( activities && activities.length ){
                    dbStage = activities[ activities.length -1 ];
                    completed = true;
                    hasActivities = true;
                } else
                    response.message = "It is not possible to update the lead, before needs to have any activities."
            }

            if( body && (stage.toLocaleLowerCase() === 'lost')){
                reason = body && reason ? reason : "";
                completed = reason && reason.length ? true : false;
                theReason = reason;
                delete (body as { reason?: string }).reason;
                response.message = "The reason why must change to lost in neccesary!";
            }
        } else
            completed = true;

        if( params && params.leadId && completed ){
            let { leadId } = params;

            if( user && user.role.toLowerCase() === 'advisor' ){
                delete ( body as { assignedTo?: string }).assignedTo;
            }

            const lead = await updateLead({
                id: In([leadId])
            }, body );
            let activity: any = {};
            if( hasActivities )
                activity = await updateActivity({ id: leadId }, { notes: theReason });
            else
                activity = await saveActivity({ leadId, notes: theReason, createdBy: user.id })

            response = { ...response, ...{ lead, activity, message: "Lead updated successfully" }};
            if( !lead ) response = { ...response, ...{ lead: {}, message: "Lead not found"} };
        }

        await saveHistory({
            log: JSON.stringify({
                file: 'controller.lead.updateLeadBy',
                case: 'patch-try',
                message: response.message,
                operation: "Update a lead and validate if the lead state has changed"
            }),
            createdBy: user.id || 0
        });
    } catch( error: any ){
        status = 500
        response.message = `Internal Server. ${error.message}`
        await saveHistory({
            log: JSON.stringify({
                file: 'controller.lead.updateLeadBy',
                case: 'catch',
                message: error.message,
            }),
            createdBy: user.id || 0
        });
    }

    res.status( status ).json( response );
}

const deleteLeadBy = async (req: Request, res: Response ): Promise<void> => {
        let status = 200;
    let response: any = {};
    const { user } = req;

    try {
        if( user && user.role.toLowerCase() === 'admin' ){
            if( req.params && req.params.leadId){
                let { leadId } = req.params;
                const leads = await deleteLead({
                    id: In([leadId])
                });

                response = { ... { leads }};
                if( !leads ) response = { ... {leads: {}, message: "Lead not found"} };
            }
        } else {
            status = 401;
            response.message = "Permiso denegado para eliminar un registro";
            response.role = user.role;
        }

        await saveHistory({
            log: JSON.stringify({
                file: 'controller.lead.deleteLeadBy',
                case: 'post-try',
                message: response.message,
                operation: "Delete a lead only allowed by the admin role"
            }),
            createdBy: user.id || 0
        });
    } catch( error: any ){
        status = 500
        response.message = `Internal Server. ${error.message}`
        await saveHistory({
            log: JSON.stringify({
                file: 'controller.lead.deleteLeadBy',
                case: 'catch',
                message: error.message,
            }),
            createdBy: user.id
        });
    }

    res.status( status ).json( response );
}

export { save, getLeads, getLead, updateLeadBy, deleteLeadBy }