import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { getHistory, saveToHistory, deleteFromHistory } from '../lib/history';

export default function HistorySection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await getHistory(user.uid);
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUsePrompt = (text) => {
    // Find the prompt input and set its value
    const promptInput = document.querySelector('textarea[value]');
    if (promptInput) {
      promptInput.value = text;
      promptInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    toast.success('Prompt loaded!');
  };

  const handleDelete = async (id) => {
    try {
      await deleteFromHistory(user.uid, id);
      setHistory(history.filter((item) => item.id !== id));
      toast.success('Deleted from history');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  if (!user) return null;

  return (
    <section
      id="history-section"
      className="card p-6 my-8"
      style={{ display: visible ? 'block' : 'none' }}
    >
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold text-foreground">My Prompt History</h2>
        <button
          onClick={() => setVisible(false)}
          className="btn-secondary px-4 py-2 text-sm"
          style={{ width: 'auto' }}
        >
          Hide History
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5 text-foreground-muted text-sm">Loading history...</div>
      ) : history.length === 0 ? (
        <div className="text-center py-8 text-foreground-subtle text-sm">
          No history yet. Start improving prompts to see them here!
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-background-elevated/50 border border-border rounded-lg hover:border-accent/20 transition-colors duration-200"
            >
              <div className="text-xs text-foreground-subtle mb-2">
                {new Date(item.createdAt).toLocaleString()}
              </div>
              <div className="text-xs text-foreground-subtle uppercase tracking-wide mb-1 font-semibold">
                Original Prompt
              </div>
              <div className="text-sm text-foreground-muted mb-3 p-2 bg-background-elevated rounded border-l-2 border-foreground-subtle whitespace-pre-wrap break-words max-h-20 overflow-hidden">
                {item.originalPrompt}
              </div>
              {item.improvedPrompt && (
                <>
                  <div className="text-xs text-foreground-subtle uppercase tracking-wide mb-1 font-semibold">
                    Improved Prompt
                  </div>
                  <div className="text-sm text-foreground p-2 bg-accent/5 rounded border-l-2 border-accent whitespace-pre-wrap break-words max-h-28 overflow-hidden">
                    {item.improvedPrompt}
                  </div>
                </>
              )}
              <div className="flex gap-2 mt-2.5">
                <button
                  onClick={() => handleUsePrompt(item.improvedPrompt || item.originalPrompt)}
                  className="btn-primary px-3.5 py-1.5 text-xs"
                >
                  Use
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="px-3.5 py-1.5 text-xs rounded bg-transparent text-foreground-muted border border-border hover:text-red-400 hover:border-red-400/30 transition-colors duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
