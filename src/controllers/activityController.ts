import { Request, Response } from "express";
import { In } from "typeorm";

import {
    getLeadByOne,
    updateLead,
    saveActivity,
    getActivityByFilters,
    saveHistory
} from "../repositories/index";

const save = async (
    req: Request,
    res: Response
): Promise< void > => {
    let status = 201;
    let response: any = {
        message: ""
    };
    const { body, user, params } = req;

    try {
        const { id } = user;
        const { leadId }: any = params;
        let { notes, type } = body;

        const currentLead = await getLeadByOne({
                where: {
                    id: In([leadId]),
                    assignedTo: In([id])
                },
            }
        );

        if( currentLead ){
            if( !notes ){
                status = 400;
                response.message = `Bad request,\n\ Activity's note not completed`;
            } else {
                const activity = {notes, type, leadId, createdBy: id};
                const newActivity = saveActivity( activity );
                if( currentLead.stage.toLowerCase() === 'new' )
                    await updateLead({
                        id: leadId 
                    }, { stage: "contacted"});
                response = {...response, ... {"activity": activity}};
            }
        } else {
            status = 401;
            response.message = "You don't have permission to save an activity"
        }
        await saveHistory({
            log: JSON.stringify({
                file: 'controller.activity.save',
                case: 'post-try',
                message: response.message,
                operation: "Save an activity for a lead and if the lead is new to change to conected"
            }),
            createdBy: user.id || 0
        });
    } catch ( error: any ){
        status = 500;
        response.message = `Internal Server` + `\n${error.message}`;
        await saveHistory({
            log: JSON.stringify({
                file: 'controller.activity.save',
                case: 'post-catch',
                message: error.message,
            }),
            createdBy: user.id || 0
        });
    }

    res.status( status ).json( response );
}

const getActivities = async (req: Request, res: Response): Promise<void> => {
    let status = 200;
    let response: any = {};
    const { user, params } = req;

    try {
        if( params && params.leadId){
            let { leadId } = params;
            const leads = await getActivityByFilters({
                where: {
                    leadId: In([leadId])
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
                file: 'controller.activity.getActivities',
                case: 'post-catch',
                message: error.message,
            }),
            createdBy: user.id || 0
        });
    }

    res.status( status ).json( response );
}

export { save, getActivities }