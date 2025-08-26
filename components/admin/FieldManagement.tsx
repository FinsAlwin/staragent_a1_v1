import React, { useState } from "react";
import { useAppContext } from "@/context/AppContext"; // Updated import path
import { type ExtractionField } from "../../types"; // Updated import path
import Modal from "@/components/common/Modal"; // Updated import path

const FieldManagement: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { extractionFields } = state;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentField, setCurrentField] = useState<Partial<ExtractionField>>(
    {}
  );
  const [isEditing, setIsEditing] = useState(false);

  const openModalForCreate = () => {
    setCurrentField({ key: "", label: "", description: "" });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openModalForEdit = (field: ExtractionField) => {
    setCurrentField({ ...field });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentField({});
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCurrentField((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentField.key || !currentField.label) {
      alert("Field Key and Label are required.");
      return;
    }

    if (isEditing && currentField.id) {
      dispatch({
        type: "UPDATE_EXTRACTION_FIELD",
        payload: currentField as ExtractionField,
      });
    } else {
      dispatch({
        type: "ADD_EXTRACTION_FIELD",
        payload: {
          ...currentField,
          id: Date.now().toString(),
        } as ExtractionField,
      });
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this field?")) {
      dispatch({ type: "DELETE_EXTRACTION_FIELD", payload: id });
    }
  };

  const generateKeyFromName = (label: string): string => {
    return label
      .toLowerCase()
      .replace(/\s+/g, "_") // Replace spaces with underscores
      .replace(/[^a-z0-9_]/g, "") // Remove non-alphanumeric characters except underscores
      .substring(0, 50); // Limit length
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const label = e.target.value;
    const key = generateKeyFromName(label);
    setCurrentField((prev) => ({ ...prev, label, key }));
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-semibold text-gray-700">
          Manage Extraction Fields
        </h3>
        <button
          onClick={openModalForCreate}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
        >
          Add New Field
        </button>
      </div>

      {extractionFields.length === 0 ? (
        <p className="text-gray-500">No extraction fields defined yet.</p>
      ) : (
        <ul className="space-y-3">
          {extractionFields.map((field: ExtractionField) => (
            <li
              key={field.id}
              className="p-4 border border-gray-200 rounded-md flex flex-col sm:flex-row justify-between sm:items-center hover:bg-gray-50 transition-colors"
            >
              <div className="mb-2 sm:mb-0">
                <p className="font-semibold text-gray-800">
                  {field.label}{" "}
                  <span className="text-sm text-gray-500">({field.key})</span>
                </p>
                {field.description && (
                  <p className="text-sm text-gray-600">{field.description}</p>
                )}
              </div>
              <div className="space-x-2 flex-shrink-0">
                <button
                  onClick={() => openModalForEdit(field)}
                  className="text-blue-500 hover:text-blue-700 font-medium px-2 py-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(field.id)}
                  className="text-red-500 hover:text-red-700 font-medium px-2 py-1"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={isEditing ? "Edit Extraction Field" : "Add Extraction Field"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="label"
              className="block text-sm font-medium text-gray-700"
            >
              Field Label (User-facing)
            </label>
            <input
              type="text"
              name="label"
              id="label"
              value={currentField.label || ""}
              onChange={handleLabelChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="key"
              className="block text-sm font-medium text-gray-700"
            >
              Field Key (for JSON, auto-generated)
            </label>
            <input
              type="text"
              name="key"
              id="key"
              value={currentField.key || ""}
              onChange={handleInputChange}
              required
              readOnly
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              This key is used in the JSON output. It&apos;s generated from the
              label.
            </p>
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description (Optional, guidance for AI)
            </label>
            <textarea
              name="description"
              id="description"
              value={currentField.description || ""}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 border border-transparent rounded-md shadow-sm"
            >
              {isEditing ? "Save Changes" : "Add Field"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FieldManagement;
