export const adminService = {
    async getAuditRequests() {
        return [
            { id: '1', user: 'Jane Doe', email: 'janedoe@gmail.com', field: 'Full Name', oldValue: 'Jane Doe', newValue: 'Jane S. Doe', date: '2h ago' },
            { id: '2', user: 'John Smith', email: 'jsmith22@gmail.com', field: 'Major', oldValue: 'BEED', newValue: 'BSED - Math', date: '5h ago' },
            { id: '3', user: 'Shane Hollander', email: 'hollandershane@mail.com', field: 'Full Name', oldValue: 'Shane Hollander', newValue: 'Inday Sara Duterte', date: '1d ago' }
        ];
    },

    async getStudentRegistry() {
        return [
            { id: '101', name: 'Alice Guo', email: 'alice@student.com', major: 'BEED', code: 'XL8290', status: 'Active' },
            { id: '102', name: 'Bob Ross', email: 'bob@student.com', major: 'BSED-Art', code: 'PN1122', status: 'Active' },
            { id: '103', name: 'Charlie Day', email: 'char@student.com', major: 'BSED-English', code: 'ZZ5544', status: 'Suspended' },
        ];
    },

    async processAudit(id: string, status: 'approved' | 'rejected') {
        return true;
    }
};