import * as DocumentPicker from "expo-document-picker";
import { File, Paths } from "expo-file-system/next";
import { supabase } from "../lib/supabase";

export type MaterialType = "handout" | "recorded_session";

export interface LearningMaterial {
  material_id: number;
  title: string;
  fileType: string;
  fileUrl: string;
  youtubeId: string | null;
  storagePath: string | null;
  isDownloadable: boolean;
  fileSize: number | null;
  uploadedAt: string;
  materialType: MaterialType;
  module_id: number;
  admin_id: string;
}

export async function getMaterialsByModule(
  moduleId: number,
  type: MaterialType,
): Promise<LearningMaterial[]> {
  const { data, error } = await supabase
    .from("learning_material")
    .select("*")
    .eq("module_id", moduleId)
    .eq("materialType", type)
    .order("uploadedAt", { ascending: false });

  if (error) {
    console.error("getMaterialsByModule:", error.message);
    return [];
  }
  return (data ?? []) as LearningMaterial[];
}

export async function uploadHandout(
  moduleId: number,
  adminId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
      ],
      copyToCacheDirectory: true,
    });

    if (result.canceled) return { success: false };

    const file = result.assets[0];
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
    const storagePath = `module_${moduleId}/${Date.now()}_${file.name}`;

    console.log("Reading file...");

    // Use new expo-file-system/next API
    const fileObj = new File(file.uri);
    const base64 = await fileObj.base64();

    console.log("File read, uploading...");

    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const { error: storageError } = await supabase.storage
      .from("learning-materials")
      .upload(storagePath, bytes, {
        contentType: file.mimeType ?? "application/octet-stream",
        upsert: false,
      });

    if (storageError) throw new Error(storageError.message);

    console.log("Upload success, inserting DB row...");

    const { data: urlData } = supabase.storage
      .from("learning-materials")
      .getPublicUrl(storagePath);

    const { error: dbError } = await supabase.from("learning_material").insert({
      title: file.name,
      fileType: ext,
      fileUrl: urlData.publicUrl,
      storagePath,
      isDownloadable: true,
      fileSize: file.size ?? 0,
      materialType: "handout",
      module_id: moduleId,
      admin_id: adminId,
      uploadedAt: new Date().toISOString(),
    });
    if (dbError) throw new Error(dbError.message);

    console.log("DB insert success");
    return { success: true };
  } catch (err: any) {
    console.error("uploadHandout error:", err.message);
    return { success: false, error: err.message };
  }
}

export async function addRecordedSession(
  moduleId: number,
  adminId: string,
  title: string,
  youtubeUrl: string,
  youtubeId: string,
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from("learning_material").insert({
    title,
    fileType: "youtube",
    fileUrl: youtubeUrl,
    youtubeId,
    storagePath: null,
    isDownloadable: false,
    fileSize: null,
    materialType: "recorded_session",
    module_id: moduleId,
    admin_id: adminId,
    uploadedAt: new Date().toISOString(),
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deleteMaterial(
  material: LearningMaterial,
): Promise<{ success: boolean; error?: string }> {
  if (material.storagePath) {
    const { error: storageError } = await supabase.storage
      .from("learning-materials")
      .remove([material.storagePath]);
    if (storageError) return { success: false, error: storageError.message };
  }

  const { error } = await supabase
    .from("learning_material")
    .delete()
    .eq("material_id", material.material_id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function downloadMaterial(
  material: LearningMaterial,
): Promise<{ success: boolean; uri?: string; error?: string }> {
  try {
    console.log("Downloading file...", material.fileUrl);

    const { data, error } = await supabase.storage
      .from("learning-materials")
      .download(material.storagePath!);

    if (error) throw new Error(error.message);
    if (!data) throw new Error("No data returned");

    // Use FileReader to convert Blob to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]);
      };
      reader.onerror = () => reject(new Error("FileReader failed"));
      reader.readAsDataURL(data);
    });

    // Sanitize filename — remove special characters that break Android paths
    const safeTitle = material.title
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/_+/g, "_");

    // Use Paths.document.uri instead of Paths.document directly
    const docDir = Paths.document.uri ?? Paths.document.toString();
    console.log("Paths.document:", Paths.document);
    console.log("Paths.document type:", typeof Paths.document);
    console.log("Paths.document keys:", Object.keys(Paths.document as any));
    const localFile = new File(docDir + safeTitle);

    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const writer = localFile.writableStream().getWriter();
    await writer.write(bytes);
    await writer.close();

    console.log("Downloaded to:", localFile.uri);
    return { success: true, uri: localFile.uri };
  } catch (err: any) {
    console.error("downloadMaterial error:", err.message);
    return { success: false, error: err.message };
  }
}

export async function getModulesByCourse(courseId: number) {
  const { data, error } = await supabase
    .from("module")
    .select("module_id, moduleName, description")
    .eq("course_id", courseId)
    .order("module_id");

  if (error) {
    console.error("getModulesByCourse:", error.message);
    return [];
  }
  return data ?? [];
}
