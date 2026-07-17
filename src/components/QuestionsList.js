"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FiTrash2 as Trash2, FiPlus as Plus, FiEdit2 as Edit2, FiCheck as Check, FiX as X } from "react-icons/fi";
export function QuestionsList({ initialHabits, userId }) {
  const supabase = createClient();
  const [habits, setHabits] = useState(initialHabits);
  const [newTitle, setNewTitle] = useState("");
  const [newQuestion, setNewQuestion] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editQuestion, setEditQuestion] = useState("");
  const handleAdd = async () => {
    if (!newTitle.trim() || !newQuestion.trim()) return;
    const { data, error } = await supabase.from("habits").insert({
      user_id: userId,
      title: newTitle.trim(),
      question: newQuestion.trim(),
      sort_order: habits.length,
      active: true
    }).select().single();
    if (error) {
      alert("Failed to add question: " + error.message);
    } else if (data) {
      setHabits([...habits, data]);
      setNewTitle("");
      setNewQuestion("");
    }
  };
  const handleDelete = async (id) => {
    const { error } = await supabase.from("habits").update({ active: false }).eq("id", id);
    if (!error) {
      setHabits(habits.filter((h) => h.id !== id));
    }
  };
  const startEdit = (h) => {
    setEditingId(h.id);
    setEditTitle(h.title);
    setEditQuestion(h.question);
  };
  const saveEdit = async (id) => {
    const { error } = await supabase.from("habits").update({ title: editTitle.trim(), question: editQuestion.trim() }).eq("id", id);
    if (!error) {
      setHabits(habits.map((h) => h.id === id ? { ...h, title: editTitle, question: editQuestion } : h));
      setEditingId(null);
    }
  };
  return <div className="mx-auto w-full max-w-md pt-24 pb-8">
      <h2 className="mb-6 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Manage Questions</h2>

      <div className="mb-8 rounded-2xl bg-white p-4 shadow-sm dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
        <h3 className="mb-4 text-sm font-medium text-zinc-500">Add New Habit</h3>
        <input
    type="text"
    placeholder="Title (e.g. Hit Gym)"
    value={newTitle}
    onChange={(e) => setNewTitle(e.target.value)}
    className="mb-3 w-full rounded-lg border border-zinc-200 p-3 text-sm bg-white text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
  />
        <input
    type="text"
    placeholder="Question (e.g. Did you hit the gym?)"
    value={newQuestion}
    onChange={(e) => setNewQuestion(e.target.value)}
    className="mb-4 w-full rounded-lg border border-zinc-200 p-3 text-sm bg-white text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
  />
        <button
    onClick={handleAdd}
    className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 p-3 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
  >
          <Plus className="h-4 w-4" /> Add Question
        </button>
      </div>

      <div className="space-y-3">
        {habits.map((h) => <div key={h.id} className="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800">
            {editingId === h.id ? <>
                <input
    type="text"
    value={editTitle}
    onChange={(e) => setEditTitle(e.target.value)}
    className="w-full rounded-lg border border-zinc-200 p-2 text-sm bg-white text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
  />
                <input
    type="text"
    value={editQuestion}
    onChange={(e) => setEditQuestion(e.target.value)}
    className="w-full rounded-lg border border-zinc-200 p-2 text-sm bg-white text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
  />
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={() => setEditingId(null)} className="rounded-lg p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                    <X className="h-4 w-4" />
                  </button>
                  <button onClick={() => saveEdit(h.id)} className="rounded-lg p-2 text-emerald-500 hover:text-emerald-600">
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              </> : <>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">{h.question}</h4>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{h.title}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(h)} className="p-2 text-zinc-400 hover:text-blue-500">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(h.id)} className="p-2 text-zinc-400 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>}
          </div>)}
        {habits.length === 0 && <p className="text-center text-sm text-zinc-500 py-8">No habits yet. Add one above!</p>}
      </div>
    </div>;
}
