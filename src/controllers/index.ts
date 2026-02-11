import { login, getMe } from '../controllers/authControllers';
import {
    deleteLeadBy,
    getLead,
    getLeads,
    save,
    updateLeadBy,
} from '../controllers/leadController';
import { save as saveActivity, getActivities } from '../controllers/activityController';
import { getMetrics } from '../controllers/metricsController'

export {
    login, getMe,
    deleteLeadBy,
    getLead,
    getLeads,
    save,
    updateLeadBy,
    saveActivity,
    getActivities,
    getMetrics
};