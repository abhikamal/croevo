const supabase = require('../config/supabase');

/**
 * Database Service for Supabase
 * Abstracts database operations to keeping routes clean.
 */
const db = {
    /**
     * Job Postings Operations
     */
    jobPostings: {
        async getAll() {
            const { data, error } = await supabase
                .from('job_postings')
                .select('*')
                .order('order', { ascending: true });

            if (error) throw error;
            return data;
        },

        async create(jobData) {
            const { data, error } = await supabase
                .from('job_postings')
                .insert([jobData])
                .select();

            if (error) throw error;
            return data[0];
        },

        async update(id, updates) {
            const { data, error } = await supabase
                .from('job_postings')
                .update(updates)
                .eq('id', id)
                .select();

            if (error) throw error;
            return data[0];
        },

        async delete(id) {
            const { error } = await supabase
                .from('job_postings')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        }
    },

    /**
     * Team Members Operations
     */
    teamMembers: {
        async getAll() {
            const { data, error } = await supabase
                .from('team_members')
                .select('*')
                .order('order', { ascending: true });

            if (error) throw error;
            return data;
        },

        async create(memberData) {
            const { data, error } = await supabase
                .from('team_members')
                .insert([memberData])
                .select();

            if (error) throw error;
            return data[0];
        },

        async update(id, updates) {
            const { data, error } = await supabase
                .from('team_members')
                .update(updates)
                .eq('id', id)
                .select();

            if (error) throw error;
            return data[0];
        },

        async delete(id) {
            const { error } = await supabase
                .from('team_members')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        }
    }
};

module.exports = db;
