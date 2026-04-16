import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import Panel from "../../components/Panel";
import { useApp } from "../../context/AppContext";
import { appCopy, type DocType, type UploadedImage } from "../../data/content";
import { uploadDocumentApi, uploadImageApi } from "../../lib/api";
import { readDocumentFile, readUploadFile } from "../../lib/utils";

const GUIDE_ICONS = ["💡", "🔍", "👄", "🚫"];

function getUploadSource(image: UploadedImage) {
  if (!image.objectKey) return { label: "Pending", tone: "bg-stone-100 text-stone-700" };
  if (image.objectKey.startsWith("local/")) return { label: "Local", tone: "bg-amber-100 text-amber-800" };
  return { label: "S3", tone: "bg-emerald-100 text-emerald-800" };
}

function FileCard({ file, onRemove }: { file: UploadedImage; onRemove: () => void }) {
  const source = getUploadSource(file);
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-stone-900/10 bg-stone-50">
      {file.isPdf ? (
        <div className="flex h-32 w-full flex-col items-center justify-center gap-2 bg-rose-50/60">
          <span className="text-3xl">📄</span>
          <p className="px-3 text-center text-xs font-semibold text-rose-900 truncate w-full text-center">PDF</p>
        </div>
      ) : (
        <img alt={file.name} className="h-32 w-full object-cover" src={file.previewUrl} />
      )}
      <div className="p-3 text-xs text-stone-600">
        <p className="truncate font-semibold text-stone-900">{file.name}</p>
        <p className="mt-0.5 text-stone-400">{(file.sizeBytes / 1024).toFixed(0)} KB</p>
        <span className={`mt-1.5 inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${source.tone}`}>
          {source.label}
        </span>
      </div>
      <button
        aria-label="Remove file"
        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-stone-900/70 text-white text-xs opacity-0 transition-opacity group-hover:opacity-100 hover:bg-rose-700"
        onClick={onRemove}
      >
        ✕
      </button>
    </div>
  );
}

function UploadZone({
  label,
  description,
  acceptAttr,
  icon,
  accentClass,
  uploading,
  onFiles,
}: {
  label: string;
  description: string;
  acceptAttr: string;
  icon: string;
  accentClass: string;
  uploading: boolean;
  onFiles: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="block cursor-pointer">
      <div
        className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
          uploading
            ? "border-amber-300 bg-amber-50/60 cursor-wait"
            : `border-stone-300 bg-stone-50 hover:border-stone-400 hover:bg-stone-100 ${accentClass}`
        }`}
      >
        <span className="text-3xl">{uploading ? "⏳" : icon}</span>
        <p className="mt-2 text-sm font-bold text-stone-700">{uploading ? "Uploading…" : label}</p>
        <p className="mt-1 text-xs text-stone-400">{description}</p>
      </div>
      <input accept={acceptAttr} className="sr-only" disabled={uploading} multiple onChange={onFiles} type="file" />
    </label>
  );
}

export default function ImageUpload() {
  const {
    language, uploadedImages, setUploadedImages,
    uploadedDocuments, setUploadedDocuments,
    setQualityResult, setPaymentComplete, setGeneratedCase, setCaseShared, authToken, setActiveCaseId,
  } = useApp();
  const copy = appCopy[language];
  const navigate = useNavigate();

  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingBiopsy, setUploadingBiopsy] = useState(false);
  const [uploadingConsult, setUploadingConsult] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const biopsyDocs = uploadedDocuments.filter((d) => d.docType === "biopsy_report");
  const consultDocs = uploadedDocuments.filter((d) => d.docType === "consultation_report");

  function resetCaseState() {
    setQualityResult(null);
    setPaymentComplete(false);
    setGeneratedCase(null);
    setCaseShared(false);
    setActiveCaseId(null);
  }

  async function handleOralImages(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    setUploadingImages(true);
    setUploadError(null);
    try {
      const next = await Promise.all(
        files.map(async (file) => {
          const local = await readUploadFile(file);
          try {
            const remote = await uploadImageApi(file, authToken);
            return { ...local, objectKey: remote.objectKey, remoteUrl: remote.fileUrl, docType: "oral_image" as DocType };
          } catch {
            return { ...local, docType: "oral_image" as DocType };
          }
        }),
      );
      setUploadedImages([...uploadedImages, ...next]);
      resetCaseState();
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploadingImages(false);
      event.target.value = "";
    }
  }

  async function handleDocumentFiles(
    event: React.ChangeEvent<HTMLInputElement>,
    docType: DocType,
    setUploading: (v: boolean) => void,
  ) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    setUploadError(null);
    try {
      const next = await Promise.all(
        files.map(async (file) => {
          const local = await readDocumentFile(file, docType);
          try {
            const remote = await uploadDocumentApi(file, authToken);
            return { ...local, objectKey: remote.objectKey, remoteUrl: remote.fileUrl };
          } catch {
            return local;
          }
        }),
      );
      setUploadedDocuments([...uploadedDocuments, ...next]);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  function removeOralImage(id: string) {
    setUploadedImages(uploadedImages.filter((f) => f.id !== id));
    resetCaseState();
  }

  function removeDocument(id: string) {
    setUploadedDocuments(uploadedDocuments.filter((f) => f.id !== id));
  }

  return (
    <Layout>
      <Panel
        title={copy.uploadTitle}
        subtitle="Upload oral images and optionally attach past biopsy reports or previous consultation documents."
        accent="bg-[linear-gradient(90deg,#6f1d1b,#b6462b,#d7a83d)]"
      >
        <div className="flex flex-col gap-8">

          {/* ── Section 1: Oral cavity images ────────────────────── */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-900 text-xs font-bold text-white">1</span>
              <div>
                <p className="font-bold text-stone-900">Oral cavity images <span className="text-rose-600">*</span></p>
                <p className="text-xs text-stone-500">At least one clear JPG or PNG image required.</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
              {/* Guidance */}
              <div className="rounded-3xl border border-dashed border-stone-900/15 bg-stone-50/60 p-6">
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-stone-600">Capture guidance</p>
                <div className="mt-4 grid gap-2.5">
                  {[copy.uploadGuide1, copy.uploadGuide2, copy.uploadGuide3, copy.uploadGuide4].map((guide, i) => (
                    <div key={guide} className="flex items-center gap-3 rounded-2xl border border-stone-900/10 bg-white px-4 py-3.5 text-sm text-stone-700 shadow-sm">
                      <span className="text-lg shrink-0">{GUIDE_ICONS[i]}</span>
                      {guide}
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-200/60 p-4 text-xs text-amber-800 leading-relaxed">
                  Accepted: JPG, PNG. Add multiple images in one pick or upload several times.
                </div>
              </div>

              {/* Upload + previews */}
              <div className="rounded-3xl border border-stone-900/10 bg-white/90 p-6">
                <UploadZone
                  acceptAttr="image/png,image/jpeg"
                  accentClass=""
                  description="or drag & drop · JPG / PNG"
                  icon="📷"
                  label="Add oral images"
                  onFiles={handleOralImages}
                  uploading={uploadingImages}
                />
                {uploadedImages.length > 0 && (
                  <div className="mt-4 grid gap-3 grid-cols-2 sm:grid-cols-3">
                    {uploadedImages.map((img) => (
                      <FileCard key={img.id} file={img} onRemove={() => removeOralImage(img.id)} />
                    ))}
                  </div>
                )}
                {uploadedImages.length === 0 && !uploadingImages && (
                  <p className="mt-3 text-center text-xs text-stone-400">No images selected yet.</p>
                )}
                {uploadedImages.length > 0 && (
                  <p className="mt-3 text-xs text-stone-500">
                    <span className="font-semibold text-stone-900">{uploadedImages.length}</span> image{uploadedImages.length !== 1 ? "s" : ""} selected. Hover an image to remove.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Section 2: Past biopsy reports ───────────────────── */}
          <div className="rounded-3xl border border-stone-900/10 bg-stone-50/50 p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-200 text-xs font-bold text-stone-600">2</span>
              <div>
                <p className="font-bold text-stone-900">Past biopsy reports <span className="text-xs font-normal text-stone-400">(optional)</span></p>
                <p className="text-xs text-stone-500">Upload PDF or image scans of any previous biopsy or histopathology reports.</p>
              </div>
            </div>
            <UploadZone
              acceptAttr="image/png,image/jpeg,application/pdf"
              accentClass="hover:border-sky-400 hover:bg-sky-50/40"
              description="PDF, JPG, or PNG · up to 25 MB each"
              icon="🔬"
              label="Add biopsy reports"
              onFiles={(e) => handleDocumentFiles(e, "biopsy_report", setUploadingBiopsy)}
              uploading={uploadingBiopsy}
            />
            {biopsyDocs.length > 0 && (
              <div className="mt-4 grid gap-3 grid-cols-2 sm:grid-cols-4">
                {biopsyDocs.map((doc) => (
                  <FileCard key={doc.id} file={doc} onRemove={() => removeDocument(doc.id)} />
                ))}
              </div>
            )}
          </div>

          {/* ── Section 3: Previous consultations / reports ───────── */}
          <div className="rounded-3xl border border-stone-900/10 bg-stone-50/50 p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-200 text-xs font-bold text-stone-600">3</span>
              <div>
                <p className="font-bold text-stone-900">Previous doctor consultations &amp; reports <span className="text-xs font-normal text-stone-400">(optional)</span></p>
                <p className="text-xs text-stone-500">Upload prescriptions, OPD notes, X-rays, or any relevant prior consultation documents.</p>
              </div>
            </div>
            <UploadZone
              acceptAttr="image/png,image/jpeg,application/pdf"
              accentClass="hover:border-violet-400 hover:bg-violet-50/40"
              description="PDF, JPG, or PNG · up to 25 MB each"
              icon="📋"
              label="Add consultation documents"
              onFiles={(e) => handleDocumentFiles(e, "consultation_report", setUploadingConsult)}
              uploading={uploadingConsult}
            />
            {consultDocs.length > 0 && (
              <div className="mt-4 grid gap-3 grid-cols-2 sm:grid-cols-4">
                {consultDocs.map((doc) => (
                  <FileCard key={doc.id} file={doc} onRemove={() => removeDocument(doc.id)} />
                ))}
              </div>
            )}
          </div>

          {uploadError && (
            <div className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {uploadError}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              className="action-button"
              disabled={uploadedImages.length === 0}
              onClick={() => navigate("/patient/quality")}
            >
              Continue to quality check →
            </button>
            {uploadedDocuments.length > 0 && (
              <p className="self-center text-xs text-stone-500">
                + {uploadedDocuments.length} supporting document{uploadedDocuments.length !== 1 ? "s" : ""} attached
              </p>
            )}
          </div>

        </div>
      </Panel>
    </Layout>
  );
}
