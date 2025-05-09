"use client";

type AdditionalInfoFormData = {
  roasterNotes: string;
  tastingNotes: string;
  roastDate: string;
  wash: string;
  process: string;
  roastLevel: string;
  isPublic: boolean;
};

type AdditionalInfoFormProps = {
  formData: AdditionalInfoFormData;
  onChange: (data: AdditionalInfoFormData) => void;
  disabled?: boolean;
};

export default function AdditionalInfoForm({
  formData,
  onChange,
  disabled = false,
}: AdditionalInfoFormProps) {
  // Handle form field changes
  const handleChange = (field: keyof AdditionalInfoFormData, value: any) => {
    onChange({
      ...formData,
      [field]: value,
    });
  };

  return (
    <div className="border-t pt-4 mt-4">
      <h3 className="text-lg font-medium mb-3">
        Additional Information (Optional)
      </h3>

      <div className="space-y-4">
        {/* Roaster Notes */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Roaster Notes
          </label>
          <textarea
            value={formData.roasterNotes || ""}
            onChange={(e) => handleChange("roasterNotes", e.target.value)}
            className="textarea textarea-bordered w-full"
            rows={3}
            placeholder="Notes from the roaster about this coffee"
            disabled={disabled}
          />
        </div>

        {/* Tasting Notes */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Your Tasting Notes
          </label>
          <textarea
            value={formData.tastingNotes || ""}
            onChange={(e) => handleChange("tastingNotes", e.target.value)}
            className="textarea textarea-bordered w-full"
            rows={3}
            placeholder="What did you taste?"
            disabled={disabled}
          />
        </div>

        {/* Roast Date */}
        <div>
          <label className="block text-sm font-medium mb-1">Roast Date</label>
          <input
            type="date"
            value={formData.roastDate || ""}
            onChange={(e) => handleChange("roastDate", e.target.value)}
            className="input input-bordered w-full"
            disabled={disabled}
          />
        </div>

        {/* Wash */}
        <div>
          <label className="block text-sm font-medium mb-1">Wash</label>
          <input
            type="text"
            value={formData.wash || ""}
            onChange={(e) => handleChange("wash", e.target.value)}
            className="input input-bordered w-full"
            placeholder="Washing method"
            disabled={disabled}
          />
        </div>

        {/* Process */}
        <div>
          <label className="block text-sm font-medium mb-1">Process</label>
          <select
            value={formData.process || ""}
            onChange={(e) => handleChange("process", e.target.value)}
            className="select select-bordered w-full"
            disabled={disabled}
          >
            <option value="">Select process method</option>
            <option value="Wet">Wet</option>
            <option value="Dry">Dry</option>
            <option value="Anaerobic">Anaerobic</option>
            <option value="Carbonic Maceration">Carbonic Maceration</option>
            <option value="Washed">Washed</option>
            <option value="Natural">Natural</option>
          </select>
        </div>

        {/* Roast Level */}
        <div>
          <label className="block text-sm font-medium mb-1">Roast Level</label>
          <select
            value={formData.roastLevel || ""}
            onChange={(e) => handleChange("roastLevel", e.target.value)}
            className="select select-bordered w-full"
            disabled={disabled}
          >
            <option value="">Select roast level</option>
            <option value="Light">Light</option>
            <option value="Medium-Light">Medium-Light</option>
            <option value="Medium">Medium</option>
            <option value="Medium-Dark">Medium-Dark</option>
            <option value="Dark">Dark</option>
          </select>
        </div>

        {/* Public/Private Toggle */}
        <div className="form-control">
          <label className="label cursor-pointer justify-start gap-2">
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={formData.isPublic}
              onChange={(e) => handleChange("isPublic", e.target.checked)}
              disabled={disabled}
            />
            <span className="label-text">Make this brew profile public</span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-14">
            Public profiles can be viewed by other users
          </p>
        </div>
      </div>
    </div>
  );
}
