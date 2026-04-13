import { supabase } from "../lib/supabase";

export const adminService = {
  async getAuditRequests() {
    const { data, error } = await supabase.from("enrollment").select(`
                enrollment_id,
                student_id,
                student (
                  firstName, 
                  lastName, 
                  email 
                  ),
                paymentDetails (
                  referenceNumber,
                  payment_channel!paymentDetails_paymentChannel_id_fkey (paymentChannelName)
                ),
                curriculum!enrollment_curriculum_id_fkey (curriculumName),
                specialization!enrollment_specialization_id_fkey (specializationName),
                type_of_taker!enrollment_typeOfTaker_id_fkey (typeOfTaker),
                promo!enrollment_promo_id_fkey (promo),
                verification!enrollment_verification_id_fkey (
                    verificationStatus,
                    verification_id,
                    verificationNotes
                )`);
    if (error) {
      return [];
    }
    return data ?? [];
  },

  async getStudentRegistry() {
    const { data, error } = await supabase.from("student").select(`
                id,
                firstName,
                lastName,
                email,
                bachelorsDegree,
                majorshipTaken
            `);
    if (error) {
      return [];
    }
    return data ?? [];
  },

  async processAudit(id: string, status: "approved" | "rejected") {
    const { error } = await supabase
      .from("verificaton")
      .update({
        verificationStatus: status === "approved",
        lastVerificationDate: new Date().toISOString(),
      })
      .eq("verification_id", id);

    if (error) {
      return false;
    }
    return true;
  },
};
