import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const headerBg = require("../assets/images/llpt.jpg");

interface dataTypes {
  privacyAgreement: boolean | null; //for step1 - data priv notice
  curriculum: string | null; //for step2 - program & curriculum details
  specialization: string;
  takerType: string | null;
  firstName: string; //for step3 - personal info
  middleName: string;
  lastName: string;
  email: string;
  bachelorsDegree: string;
  lastSchool: string;
  province: string;
  promo: string; //for step4 - promotions & payment
  paymentMethod: string;
  referenceNumber: string;
  paymentNoticeAgreement: boolean;
}

//initialize values for data preservation incase of misclick back nav
const defaultValues: dataTypes = {
  privacyAgreement: null,
  curriculum: null,
  specialization: "",
  takerType: null,
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  bachelorsDegree: "",
  lastSchool: "",
  province: "",
  promo: "",
  paymentMethod: "",
  referenceNumber: "",
  paymentNoticeAgreement: false,
};

//input validation per step
function validateStep(step: number, form: dataTypes): string[] {
  const errors: string[] = [];

  if (step === 1) {
    if (form.privacyAgreement === null)
      errors.push("Kindly select Agree or Disagree to the Privacy Notice.");
    if (form.privacyAgreement === false)
      errors.push(
        "To proceed with the enrollment, you must agree to the Data Privacy Notice.",
      );
  }

  if (step === 2) {
    const isEmpty = !form.curriculum || !form.specialization || !form.takerType;
    if (isEmpty) errors.push("Please fill in all necessary informations.");
  }

  if (step === 3) {
    const isEmpty =
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.email.trim() ||
      !form.bachelorsDegree.trim() ||
      !form.lastSchool.trim() ||
      !form.province.trim();
    if (isEmpty) errors.push("Please fill in all necessary informations.");
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errors.push("Please enter a valid email address.");
  }

  if (step === 4) {
    const isEmpty = !form.paymentMethod.trim() || !form.referenceNumber.trim();
    if (isEmpty) errors.push("Please fill in all necessary informations.");
    if (!form.paymentNoticeAgreement)
      errors.push("Kindly acknowledge that all information is correct.");
  }
  return errors;
}

export default function EnrollmentScreen() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const [dataTypes, setDataTypes] = useState<dataTypes>(defaultValues);

  /*const [privacyAgree, setPrivacyAgree] = useState<boolean | null>(null);

  const [curriculum, setCurriculum] = useState('BEEd');
  const [majorship, setMajorship] = useState('Majorship');*/
  const [isMajorOpen, setIsMajorOpen] = useState(false);
  //const [takerType, setTakerType] = useState('First time');

  //const [promo, setPromo] = useState('Promo/discount');
  const [isPromoOpen, setIsPromoOpen] = useState(false);
  //const [paymentMethod, setPaymentMethod] = useState('Select method');
  const [isMethodOpen, setIsMethodOpen] = useState(false);
  //const [paymentNoticeAgree, setPaymentNoticeAgree] = useState(false);

  //summary section
  const [summary, setSummary] = useState<Record<string, boolean>>({
    program: false,
    personalInfo: false,
    promo: false,
    payment: false,
  });
  const toggle = (key: string) =>
    setSummary((prev) => ({ ...prev, [key]: !prev[key] }));

  const setField = <field extends keyof dataTypes>(
    key: field,
    value: dataTypes[field],
  ) => setDataTypes((prev) => ({ ...prev, [key]: value }));

  const majorshipOptions = [
    "English",
    "Filipino",
    "Mathematics",
    "Science",
    "Social Values",
    "Values Education",
  ];
  const promoOptions = [
    "Advocacy Promo (BSEd and BEEd with specialization - 3500)",
    "Advocacy Promo (BEEd - 2500)",
    "Regular Rates (BSEd and BEEd with specialization - 5000)",
    "Regular Rates (BEEd - 4000)",
    "Summa Cum Laude",
  ];
  const paymentMethods = ["GCash", "Maya", "Bank Transfer", "Cash", "Others"];

  const handleContinue = () => {
    const stepErrors = validateStep(step, dataTypes);

    if (stepErrors.length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors([]);

    if (step < 5) setStep(step + 1);
    else setIsRegistrationComplete(true);
  };

  const handleBack = () => {
    setErrors([]);
    if (step > 1) setStep(step - 1);
    else router.back();
  };

  const renderProgressHeader = (title: string) => (
    <View style={styles.headerContainer}>
      <ImageBackground
        source={headerBg}
        style={styles.headerImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          {!isRegistrationComplete && (
            <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          )}

          <View style={styles.stepperRow}>
            {[1, 2, 3, 4, 5].map((num) => (
              <View key={num} style={styles.stepWrapper}>
                <View
                  style={[
                    styles.stepCircle,
                    step === num
                      ? styles.stepActive
                      : step > num
                        ? styles.stepDone
                        : styles.stepInactive,
                  ]}
                >
                  <Text
                    style={[styles.stepText, step >= num && { color: "white" }]}
                  >
                    {num}
                  </Text>
                </View>
                {num < 5 && (
                  <View
                    style={[styles.stepLine, step > num && styles.lineActive]}
                  />
                )}
              </View>
            ))}
          </View>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
      </ImageBackground>
    </View>
  );

  const errorRender = () => {
    if (errors.length === 0) return null;
    return (
      <View style={styles.errorBanner}>
        <Ionicons
          name="alert-circle"
          size={18}
          color="#c0392b"
          style={{
            marginTop: 2,
          }}
        />
        <View style={{ flex: 1, marginLeft: 8 }}>
          {errors.map((e, i) => (
            <Text key={i} style={styles.errorText}>
              . {e}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  const summaryRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value || "-"}</Text>
    </View>
  );

  const summarySection = ({
    sectionKey,
    title,
    children,
  }: {
    sectionKey: string;
    title: string;
    children: React.ReactNode;
  }) => {
    const isOpen = summary[sectionKey];
    return (
      <View style={styles.summaryCard}>
        <TouchableOpacity
          style={styles.summaryHeader}
          onPress={() => toggle(sectionKey)}
          activeOpacity={0.8}
        >
          <Text style={styles.summaryTitle}>{title}</Text>
          <Ionicons
            name={isOpen ? "chevron-up" : "chevron-down"}
            size={20}
            color="#555"
          />
        </TouchableOpacity>
        {isOpen && <View style={styles.summaryBody}>{children}</View>}
      </View>
    );
  };

  if (isRegistrationComplete) {
    return (
      <SafeAreaView style={styles.container}>
        {renderProgressHeader("Registration Complete")}
        <View style={styles.completeBody}>
          <Ionicons
            name="checkmark-circle"
            size={100}
            color="#4CD964"
            style={{ marginBottom: 15 }}
          />
          <Text style={styles.thankYouHeader}>
            Thank you for signing up to our services!
          </Text>
          <Text style={styles.statusSubtext}>
            Your registration has been received and is now awaiting admin
            approval.
          </Text>

          <View style={styles.nextStepsContainer}>
            <Text style={styles.nextStepsHeader}>
              <Ionicons name="bulb-outline" size={18} color="#FFB800" /> What
              comes next?
            </Text>
            <View style={styles.checkItem}>
              <Ionicons name="checkmark" size={18} color="#2F459B" />
              <Text style={styles.checkText}>
                You'll receive an email with your activation code once approved.
              </Text>
            </View>
            <View style={styles.checkItem}>
              <Ionicons name="checkmark" size={18} color="#2F459B" />
              <Text style={styles.checkText}>
                Relaunch the app to return to the start page.
              </Text>
            </View>
            <View style={styles.checkItem}>
              <Ionicons name="checkmark" size={18} color="#2F459B" />
              <Text style={styles.checkText}>
                Then, enter the code to activate your account.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.continueBtn, { width: "100%" }]}
            onPress={() => router.replace("/login")}
          >
            <Text style={styles.continueText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {step === 1 && (
          <View>
            {renderProgressHeader("Data Privacy Notice")}
            <View style={styles.formBody}>
              {errorRender()}
              <Text style={styles.privacyContent}>
                <Text style={styles.bold}>Teacher A Review Center</Text>{" "}
                recognizes its responsibilities under the{" "}
                <Text style={styles.bold}>RA 10173</Text>...
              </Text>
              <Text style={[styles.label, { color: "#c0392b" }]}>
                * You must agree to proceed.
              </Text>
              <TouchableOpacity
                style={styles.radioRow}
                onPress={() => setField("privacyAgreement", true)}
              >
                <Ionicons
                  name={
                    dataTypes.privacyAgreement === true
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={24}
                  color="#0D2A94"
                />
                <Text style={styles.radioLabel}>Agree</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioRow}
                onPress={() => setField("privacyAgreement", false)}
              >
                <Ionicons
                  name={
                    dataTypes.privacyAgreement === false
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={24}
                  color="#555"
                />
                <Text style={styles.radioLabel}>Disagree</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === 2 && (
          <View>
            {renderProgressHeader("Program & Curriculum")}
            <View style={styles.formBody}>
              {errorRender()}
              <Text style={styles.label}>Type of Taker:*</Text>
              <View style={{ flexDirection: "row", marginBottom: 10 }}>
                <TouchableOpacity
                  style={styles.radioRow}
                  onPress={() =>
                    setField(
                      "takerType",
                      dataTypes.takerType === "First time"
                        ? null
                        : "First time",
                    )
                  }
                >
                  <Ionicons
                    name={
                      dataTypes.takerType === "First time"
                        ? "radio-button-on"
                        : "radio-button-off"
                    }
                    size={22}
                    color="#0D2A94"
                  />
                  <Text style={styles.radioLabel}>First time</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.radioRow, { marginLeft: 20 }]}
                  onPress={() =>
                    setField(
                      "takerType",
                      dataTypes.takerType === "Retaker" ? null : "Retaker",
                    )
                  }
                >
                  <Ionicons
                    name={
                      dataTypes.takerType === "Retaker"
                        ? "radio-button-on"
                        : "radio-button-off"
                    }
                    size={22}
                    color="#0D2A94"
                  />
                  <Text style={styles.radioLabel}>Retaker</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Curriculum:*</Text>
              <TouchableOpacity
                style={styles.radioRow}
                onPress={() =>
                  setField(
                    "curriculum",
                    dataTypes.curriculum === "BEEd" ? null : "BEEd",
                  )
                }
              >
                <Ionicons
                  name={
                    dataTypes.curriculum === "BEEd"
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={22}
                  color="#0D2A94"
                />
                <Text style={styles.radioLabel}>
                  Bachelor of Elementary Education (BEEd)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioRow}
                onPress={() =>
                  setField(
                    "curriculum",
                    dataTypes.curriculum === "BSEd" ? null : "BSEd",
                  )
                }
              >
                <Ionicons
                  name={
                    dataTypes.curriculum === "BSEd"
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={22}
                  color="#0D2A94"
                />
                <Text style={styles.radioLabel}>
                  Bachelor of Secondary Education (BSEd)
                </Text>
              </TouchableOpacity>

              <Text style={styles.label}>Specialization:*</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setIsMajorOpen(!isMajorOpen)}
              >
                <Text
                  style={{ color: dataTypes.specialization ? "#000" : "#999" }}
                >
                  {" "}
                  {dataTypes.specialization || "Select Specialization"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
              {isMajorOpen && (
                <View style={styles.dropdownMenu}>
                  {majorshipOptions.map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setField("specialization", opt);
                        setIsMajorOpen(false);
                      }}
                    >
                      <Text>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {step === 3 && (
          <View>
            {renderProgressHeader("Personal Information")}
            <View style={styles.formBody}>
              {errorRender()}
              <Text style={styles.label}>First Name: *</Text>
              <TextInput
                style={styles.input}
                placeholder="Given Name"
                placeholderTextColor="#666"
                value={dataTypes.firstName}
                onChangeText={(val) => setField("firstName", val)}
              />
              <Text style={styles.label}>Middle Name:</Text>
              <TextInput
                style={styles.input}
                placeholder="Middle Name"
                placeholderTextColor="#666"
                value={dataTypes.middleName}
                onChangeText={(val) => setField("middleName", val)}
              />
              <Text style={styles.label}>Last Name: *</Text>
              <TextInput
                style={styles.input}
                placeholder="Last Name"
                placeholderTextColor="#666"
                value={dataTypes.lastName}
                onChangeText={(val) => setField("lastName", val)}
              />
              <Text style={styles.label}>Email Address: *</Text>
              <TextInput
                style={styles.input}
                placeholder="email@example.com"
                placeholderTextColor="#666"
                value={dataTypes.email}
                onChangeText={(val) => setField("email", val)}
              />
              <Text style={styles.label}>Bachelor's Degree / Majorship: *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. BSEd English"
                placeholderTextColor="#666"
                value={dataTypes.bachelorsDegree}
                onChangeText={(val) => setField("bachelorsDegree", val)}
              />
              <Text style={styles.label}>Last School Attended: *</Text>
              <TextInput
                style={styles.input}
                placeholder="University Name"
                placeholderTextColor="#666"
                value={dataTypes.lastSchool}
                onChangeText={(val) => setField("lastSchool", val)}
              />
              <Text style={styles.label}>Province: *</Text>
              <TextInput
                style={styles.input}
                placeholder="Province"
                placeholderTextColor="#666"
                value={dataTypes.province}
                onChangeText={(val) => setField("province", val)}
              />
            </View>
          </View>
        )}

        {step === 4 && (
          <View>
            {renderProgressHeader("Promotions & Payment")}
            <View style={styles.formBody}>
              {errorRender()}
              <Text style={styles.label}>Promo/Discount to avail</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setIsPromoOpen(!isPromoOpen)}
              >
                <Text style={{ color: dataTypes.promo ? "#2F459B" : "#999" }}>
                  {dataTypes.promo || "Select promo (optional)"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
              {isPromoOpen && (
                <View style={styles.dropdownMenu}>
                  {promoOptions.map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setField("promo", opt);
                        setIsPromoOpen(false);
                      }}
                    >
                      <Text style={{ color: "#2F459B", fontSize: 13 }}>
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={styles.label}>Payment Method:*</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setIsMethodOpen(!isMethodOpen)}
              >
                <Text
                  style={{ color: dataTypes.paymentMethod ? "#000" : "#999" }}
                >
                  {dataTypes.paymentMethod || "Select method"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
              {isMethodOpen && (
                <View style={styles.dropdownMenu}>
                  {paymentMethods.map((method) => (
                    <TouchableOpacity
                      key={method}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setField("paymentMethod", method);
                        setIsMethodOpen(false);
                      }}
                    >
                      <Text>{method}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={styles.label}>Reference Number:*</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Ref #"
                placeholderTextColor="#666"
                value={dataTypes.referenceNumber}
                onChangeText={(val) => setField("referenceNumber", val)}
              />
              <Text style={[styles.label, { marginTop: 15 }]}>
                Verification/Receipt:*
              </Text>
              <TouchableOpacity style={styles.uploadBtn}>
                <Text style={styles.uploadText}>Upload attachment</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.radioRow, { marginTop: 20 }]}
                onPress={() =>
                  setField(
                    "paymentNoticeAgreement",
                    !dataTypes.paymentNoticeAgreement,
                  )
                }
              >
                <Ionicons
                  name={
                    dataTypes.paymentNoticeAgreement
                      ? "checkbox"
                      : "square-outline"
                  }
                  size={24}
                  color="#0D2A94"
                />
                <Text style={[styles.radioLabel, { fontSize: 12, flex: 1 }]}>
                  I acknowledge that all info is correct.
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === 5 && (
          <View>
            {renderProgressHeader("Summary")}
            <View style={styles.formBody}>
              <Text style={styles.summaryIntro}>
                Kindly verify all information before proceeding.
              </Text>
              {summarySection({
                sectionKey: "program",
                title: "Program & Curriculum",
                children: (
                  <>
                    {summaryRow({
                      label: "Curriculum",
                      value:
                        dataTypes.curriculum === "BEEd"
                          ? "Bachelor of Elementary Education (BEEd)"
                          : dataTypes.curriculum === "BSEd"
                            ? "Bachelor of Secondary Education (BSEd)"
                            : "—",
                    })}
                    {summaryRow({
                      label: "Specialization",
                      value: dataTypes.specialization,
                    })}
                    {summaryRow({
                      label: "Type of Taker",
                      value: dataTypes.takerType ?? "—",
                    })}
                  </>
                ),
              })}
              {summarySection({
                sectionKey: "personalInfo",
                title: "Personal Information",
                children: (
                  <>
                    {summaryRow({
                      label: "Full Name",
                      value: `${dataTypes.firstName}${dataTypes.middleName ? " " + dataTypes.middleName : ""} ${dataTypes.lastName}`,
                    })}
                    {summaryRow({ label: "Email", value: dataTypes.email })}
                    {summaryRow({
                      label: "Degree / Majorship",
                      value: dataTypes.bachelorsDegree,
                    })}
                    {summaryRow({
                      label: "Last School",
                      value: dataTypes.lastSchool,
                    })}
                    {summaryRow({
                      label: "Province",
                      value: dataTypes.province,
                    })}
                  </>
                ),
              })}
              {summarySection({
                sectionKey: "promo",
                title: "Promotions & Verification",
                children: (
                  <>
                    {summaryRow({
                      label: "Promo/Discount",
                      value: dataTypes.promo || "None",
                    })}
                  </>
                ),
              })}

              {summarySection({
                sectionKey: "payment",
                title: "Payment Information",
                children: (
                  <>
                    {summaryRow({
                      label: "Payment Method",
                      value: dataTypes.paymentMethod,
                    })}
                    {summaryRow({
                      label: "Reference #",
                      value: dataTypes.referenceNumber,
                    })}
                  </>
                ),
              })}
            </View>
          </View>
        )}
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  headerContainer: { height: 220 },
  headerImage: { width: "100%", height: "100%" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(13, 42, 148, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  backBtn: { position: "absolute", top: 40, left: 20 },
  headerTitle: {
    color: "white",
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 20,
  },
  stepperRow: { flexDirection: "row", alignItems: "center", marginTop: 30 },
  stepWrapper: { flexDirection: "row", alignItems: "center" },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  stepActive: {
    backgroundColor: "#0D2A94",
    borderWidth: 2,
    borderColor: "#FFB800",
  },
  stepDone: { backgroundColor: "#FFB800" },
  stepInactive: { backgroundColor: "white" },
  stepText: { fontWeight: "bold", color: "#999", fontSize: 12 },
  stepLine: {
    width: 25,
    height: 2,
    backgroundColor: "#ccc",
    marginHorizontal: 2,
  },
  lineActive: { backgroundColor: "#FFB800" },
  formBody: { padding: 20 },
  label: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#000",
    marginTop: 15,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    color: "#000",
  },
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
  },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginTop: 5,
    backgroundColor: "#fff",
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  radioRow: { flexDirection: "row", alignItems: "center", marginVertical: 10 },
  radioLabel: { marginLeft: 10, fontSize: 14 },
  uploadBtn: {
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#000",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  uploadText: { color: "#666" },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 18,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 10,
    marginBottom: 15,
  },
  summaryText: { fontWeight: "bold" },
  footer: { padding: 20, borderTopWidth: 1, borderColor: "#eee" },
  continueBtn: {
    backgroundColor: "#0D2A94",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  continueText: { color: "white", fontWeight: "bold" },
  completeBody: { flex: 1, alignItems: "center", padding: 25 },
  thankYouHeader: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  statusSubtext: { textAlign: "center", color: "#666", marginBottom: 25 },
  nextStepsContainer: { width: "100%", marginBottom: 30 },
  nextStepsHeader: { fontWeight: "bold", marginBottom: 15, fontSize: 15 },
  checkItem: { flexDirection: "row", marginBottom: 12 },
  checkText: {
    marginLeft: 10,
    fontSize: 13,
    color: "#333",
    flex: 1,
    lineHeight: 18,
  },
  privacyContent: {
    fontSize: 14,
    color: "#333",
    lineHeight: 22,
    marginBottom: 15,
  },
  errorBanner: {
    flexDirection: "row",
    backgroundColor: "#fff5f5",
    borderWidth: 1,
    borderColor: "#e74c3c",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: "#c0392b", fontSize: 13, lineHeight: 20 },
  required: { color: "#c0392b" },
  summaryIntro: {
    fontSize: 14,
    color: "#555",
    marginBottom: 16,
    lineHeight: 20,
  },
  summaryCard: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 12,
    overflow: "hidden",
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  summaryTitle: { fontWeight: "bold", fontSize: 15, color: "#000" },
  summaryBody: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 4,
    backgroundColor: "#fafbff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  summaryRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#0D2A94",
    fontWeight: "700",
    marginBottom: 2,
  },
  summaryValue: { fontSize: 14, color: "#000" },
  bold: { fontWeight: "bold" },
});
