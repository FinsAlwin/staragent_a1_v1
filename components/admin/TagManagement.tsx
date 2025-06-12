import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext'; // Updated import path
import { type Tag } from '../../types'; // Updated import path
import Modal from '@/components/common/Modal'; // Updated import path

const TagManagement: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { tags } = state;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTag, setCurrentTag] = useState<Partial<Tag>>({});
  const [isEditing, setIsEditing] = useState(false);

  const openModalForCreate = () => {
    setCurrentTag({ name: '' });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openModalForEdit = (tag: Tag) => {
    setCurrentTag({ ...tag });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentTag({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentTag(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTag.name?.trim()) {
      alert("Tag Name is required.");
      return;
    }

    if (isEditing && currentTag.id) {
      dispatch({ type: 'UPDATE_TAG', payload: currentTag as Tag });
    } else {
      dispatch({ type: 'ADD_TAG', payload: { ...currentTag, id: Date.now().toString(), name: currentTag.name.trim() } as Tag });
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this tag?")) {
      dispatch({ type: 'DELETE_TAG', payload: id });
    }
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-semibold text-gray-700">Manage Tags</h3>
        <button
          onClick={openModalForCreate}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
        >
          Add New Tag
        </button>
      </div>

      {tags.length === 0 ? (
         <p className="text-gray-500">No tags defined yet.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag: Tag) => (
            <div key={tag.id} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium flex items-center group">
              <span>{tag.name}</span>
              <button onClick={() => openModalForEdit(tag)} className="ml-2 text-blue-500 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity text-xs px-1" aria-label={`Edit tag ${tag.name}`}>Edit</button>
              <button onClick={() => handleDelete(tag.id)} className="ml-1 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity text-xs px-1" aria-label={`Delete tag ${tag.name}`}>&times;</button>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={isEditing ? "Edit Tag" : "Add Tag"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Tag Name</label>
            <input
              type="text"
              name="name"
              id="name"
              value={currentTag.name || ''}
              onChange={handleInputChange}
              required
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
              {isEditing ? "Save Changes" : "Add Tag"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TagManagement;
