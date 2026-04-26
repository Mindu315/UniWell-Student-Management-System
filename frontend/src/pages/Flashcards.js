/**
 * Flashcards Page
 * Protected UI for creating and studying flashcards.
 */

import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import FlashcardForm from '../components/FlashcardForm';
import FlashcardViewer from '../components/FlashcardViewer';
import { flashcardAPI } from '../api';
import Swal from 'sweetalert2'

const Flashcards = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [subjectFilter, setSubjectFilter] = useState('');

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isEmptyForm,setEmptyForm]=useState(false);

  const [editingFlashcard, setEditingFlashcard] = useState(null);

  const refresh = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await flashcardAPI.getFlashcards();
      if (response.data.success) {
        setFlashcards(response.data.data.flashcards);
      } else {
        setError(response.data.message || 'Failed to load flashcards');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load flashcards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const filteredFlashcards = useMemo(() => {
    const q = subjectFilter.trim().toLowerCase();
    if (!q) return flashcards;
    return flashcards.filter((c) => (c.subject || '').toLowerCase().includes(q));
  }, [flashcards, subjectFilter]);

  const handleSubmit = async (values) => {
    setFormError('');
    setFormSuccess('');
    setSaving(true);
    try {
      if (editingFlashcard?._id) {
        const response = await flashcardAPI.updateFlashcard(editingFlashcard._id, values);
        if (response.data.success) {
          setFormSuccess('Flashcard updated successfully! 🎉');
        }
      } else {
        const response = await flashcardAPI.createFlashcard(values);
        if (response.data.success) {
          Swal.fire({
            title: "Success",
            text: "Flashcard Created !",
            icon: "success"
          });
          setEmptyForm(true);
        }
      }

      setEditingFlashcard(null);
      await refresh();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save flashcard');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormError('');
    setFormSuccess('');
    setEditingFlashcard(null);
  };

  const handleEdit = (card) => {
    setFormError('');
    setFormSuccess('');
    setEditingFlashcard(card);
  };

  const handleDelete = async (id) => {
    const confirmed=await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    })

    if(!confirmed.isConfirmed){
      return;
    }

    setFormError('');
    setFormSuccess('');
    setSaving(true);

    try {
      const response = await flashcardAPI.deleteFlashcard(id);
      if (response.data.success) {
        await Swal.fire({
            title: "Deleted!",
            text: "Flashcard has been deleted.",
            icon: "success"
          });
      }
    

      if (editingFlashcard?._id === id) setEditingFlashcard(null);
      await refresh();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to delete flashcard');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Navbar />

      <div className="container dashboard-main unified-page-shell flashcards-page-shell">
        <div className="page-header">
          <h1>Flashcards 🃏</h1>
          <p>Create study cards and flip to reveal answers.</p>
        </div>

        <div className="flashcards-layout">
          <FlashcardForm
            initialData={editingFlashcard}
            isEditing={Boolean(editingFlashcard)}
            saving={saving}
            error={formError}
            success={formSuccess}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isEmptyForm={isEmptyForm}
          />

          <div className="flashcards-right">
            <div className="flashcards-filter">
              <label htmlFor="subjectFilter">Filter by subject</label>
              <input
                id="subjectFilter"
                type="text"
                value={subjectFilter}
                placeholder="Type to filter (e.g. Biology)"
                onChange={(e) => setSubjectFilter(e.target.value)}
              />
            </div>

            {error ? <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div> : null}

            <FlashcardViewer
              flashcards={filteredFlashcards}
              loading={loading}
              error={''}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcards;
