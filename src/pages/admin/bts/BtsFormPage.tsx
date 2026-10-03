import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/forms/FormField";
import { FileField } from "@/components/forms/FileField";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  useCreateBtsMutation,
  useGetBtsByIdQuery,
  useUpdateBtsMutation,
} from "@/features/bts/btsApi";
import { getErrorMessage, getFieldErrors } from "@/utils/errors";
import { uploadMediaWithChunking } from "@/utils/chunkUpload";

export function BtsFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const existing = useGetBtsByIdQuery(id ?? "", { skip: !id });
  const [createBts, createState] = useCreateBtsMutation();
  const [updateBts, updateState] = useUpdateBtsMutation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [video, setVideo] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isChunkUploading, setIsChunkUploading] = useState(false);
  const [existingThumbnailUrl, setExistingThumbnailUrl] = useState<
    string | null
  >(null);

  const fieldErrors = getFieldErrors(createState.error ?? updateState.error);

  useEffect(() => {
    if (existing.data?.data) {
      setTitle(existing.data.data.title);
      setDescription(existing.data.data.description ?? "");
      if (existing.data.data.thumbnail || existing.data.data.image) {
        setExistingThumbnailUrl(
          existing.data.data.thumbnail ?? existing.data.data.image ?? null,
        );
      }
    }
  }, [existing.data]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const body = new FormData();
    body.append("title", title);
    body.append("description", description);

    try {
      if (video) {
        setUploadProgress(0);
        setIsChunkUploading(true);
        const uploadedVideoUrl = await uploadMediaWithChunking(
          video,
          "video",
          setUploadProgress,
        );
        body.append("video", uploadedVideoUrl);
      }

      if (thumbnail) {
        body.append("image", thumbnail);
      }

      if (isEdit && id) {
        const result = await updateBts({ id, body }).unwrap();
        toast.success(result.message ?? "BTS updated successfully");
      } else {
        if (!video) {
          toast.error("A video file is required.");
          return;
        }
        const result = await createBts(body).unwrap();
        toast.success(result.message ?? "BTS created successfully");
      }
      navigate("/admin/bts");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsChunkUploading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={isEdit ? "Edit BTS Video" : "Create BTS Video"}
        description={
          isEdit
            ? "Update details, video, and thumbnail image."
            : "Upload a new Behind-The-Scenes video and cover thumbnail."
        }
      />
      <Card className="max-w-2xl p-6 bg-[#161310]">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <FormField
            label="Title"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            error={fieldErrors.title}
            placeholder="e.g. Studio Session: Making of Midnight Drive"
          />

          <FormField
            as="textarea"
            label="Description"
            required
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            error={fieldErrors.description}
            placeholder="Provide a brief overview of what happens in this BTS clip..."
          />

          <FileField
            label="Video File"
            accept="video/*"
            required={!isEdit}
            onChange={setVideo}
            hint={
              isEdit
                ? "Leave empty to keep the current video."
                : "MP4, MOV or WebM video file."
            }
            error={fieldErrors.video}
          />

          <div className="space-y-2">
            <FileField
              label="Thumbnail / Cover Image"
              accept="image/*"
              onChange={setThumbnail}
              hint={
                isEdit
                  ? "Leave empty to keep the current thumbnail."
                  : "JPG, PNG or WebP image to display as video card poster."
              }
              error={fieldErrors.thumbnail || fieldErrors.image}
            />

            {/* Thumbnail Preview */}
            {(thumbnail || existingThumbnailUrl) && (
              <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#2d241d] bg-[#120f0d] p-2.5">
                <img
                  src={
                    thumbnail
                      ? URL.createObjectURL(thumbnail)
                      : existingThumbnailUrl!
                  }
                  alt="Thumbnail Preview"
                  className="h-16 w-28 rounded-lg object-cover border border-amber-500/30"
                />
                <div className="text-xs text-stone-400">
                  <p className="font-semibold text-stone-200">
                    {thumbnail ? "New image selected" : "Current thumbnail"}
                  </p>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    {thumbnail ? thumbnail.name : "Stored cover image"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {isChunkUploading && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs text-stone-300">
                <span>Uploading video...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#201b18]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-[#26201a]">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/admin/bts")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={createState.isLoading || updateState.isLoading || isChunkUploading}
            >
              {isEdit ? "Save Changes" : "Upload & Create BTS"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
