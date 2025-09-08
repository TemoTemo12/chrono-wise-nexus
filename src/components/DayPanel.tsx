import { useState, useEffect } from 'react';
import { Plus, Check, Trash2, Edit3, Bell, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  reminder?: Date;
}

interface Note {
  id: string;
  content: string;
  lastModified: Date;
}

interface DayData {
  date: string;
  notes: Note[];
  todos: Todo[];
}

interface DayPanelProps {
  selectedDate: Date | null;
}

export function DayPanel({ selectedDate }: DayPanelProps) {
  const [dayData, setDayData] = useState<DayData | null>(null);
  const [newTodo, setNewTodo] = useState('');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteContent, setNoteContent] = useState('');

  const dateKey = selectedDate ? selectedDate.toDateString() : '';

  useEffect(() => {
    if (!selectedDate) {
      setDayData(null);
      return;
    }

    // Load data from localStorage
    const saved = localStorage.getItem(`calendar-day-${dateKey}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      setDayData({
        ...parsed,
        notes: parsed.notes.map((n: any) => ({
          ...n,
          lastModified: new Date(n.lastModified)
        })),
        todos: parsed.todos.map((t: any) => ({
          ...t,
          reminder: t.reminder ? new Date(t.reminder) : undefined
        }))
      });
      setNoteContent(parsed.notes[0]?.content || '');
    } else {
      const newData: DayData = {
        date: dateKey,
        notes: [],
        todos: []
      };
      setDayData(newData);
      setNoteContent('');
    }
  }, [dateKey, selectedDate]);

  const saveData = (data: DayData) => {
    localStorage.setItem(`calendar-day-${dateKey}`, JSON.stringify(data));
    setDayData(data);
  };

  const addTodo = () => {
    if (!newTodo.trim() || !dayData) return;

    const todo: Todo = {
      id: Date.now().toString(),
      text: newTodo.trim(),
      completed: false
    };

    const updatedData = {
      ...dayData,
      todos: [...dayData.todos, todo]
    };

    saveData(updatedData);
    setNewTodo('');
  };

  const toggleTodo = (id: string) => {
    if (!dayData) return;

    const updatedData = {
      ...dayData,
      todos: dayData.todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    };

    saveData(updatedData);
  };

  const deleteTodo = (id: string) => {
    if (!dayData) return;

    const updatedData = {
      ...dayData,
      todos: dayData.todos.filter(todo => todo.id !== id)
    };

    saveData(updatedData);
  };

  const saveNote = () => {
    if (!dayData) return;

    const note: Note = {
      id: dayData.notes[0]?.id || Date.now().toString(),
      content: noteContent,
      lastModified: new Date()
    };

    const updatedData = {
      ...dayData,
      notes: [note]
    };

    saveData(updatedData);
    setIsEditingNote(false);
  };

  const setReminder = (todoId: string) => {
    if (!dayData || !selectedDate) return;

    const reminderTime = prompt('Set reminder time (HH:MM):', '09:00');
    if (!reminderTime) return;

    const [hours, minutes] = reminderTime.split(':').map(Number);
    const reminderDate = new Date(selectedDate);
    reminderDate.setHours(hours, minutes, 0, 0);

    if (reminderDate < new Date()) {
      alert('Cannot set reminder in the past!');
      return;
    }

    const updatedData = {
      ...dayData,
      todos: dayData.todos.map(todo =>
        todo.id === todoId ? { ...todo, reminder: reminderDate } : todo
      )
    };

    saveData(updatedData);

    // Schedule notification
    const timeUntilReminder = reminderDate.getTime() - Date.now();
    if (timeUntilReminder > 0) {
      setTimeout(() => {
        const todo = updatedData.todos.find(t => t.id === todoId);
        if (todo && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('Reminder', {
            body: `Don't forget: ${todo.text}`,
            icon: '/favicon.ico'
          });
        } else {
          alert(`Reminder: ${todo?.text}`);
        }
      }, timeUntilReminder);
    }
  };

  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  if (!selectedDate) {
    return (
      <Card className="card-gradient h-full">
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">
            <Edit3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Select a date to view notes and todos</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Day Header */}
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle className="text-xl bg-gradient-primary bg-clip-text text-transparent">
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Notes Section */}
      <Card className="card-gradient animate-slide-up">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Notes</CardTitle>
            {!isEditingNote ? (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditingNote(true)}
                className="hover-lift"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={saveNote}
                  className="hover-lift"
                >
                  <Save className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setIsEditingNote(false);
                    setNoteContent(dayData?.notes[0]?.content || '');
                  }}
                  className="hover-lift"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {isEditingNote ? (
            <Textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Write your notes for this day..."
              className="min-h-[120px] resize-none"
              autoFocus
            />
          ) : (
            <div className="min-h-[120px] p-3 bg-muted/30 rounded-lg">
              {dayData?.notes[0]?.content ? (
                <p className="whitespace-pre-wrap">{dayData.notes[0].content}</p>
              ) : (
                <p className="text-muted-foreground italic">No notes for this day yet.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Todo Section */}
      <Card className="card-gradient animate-slide-up" style={{ animationDelay: '100ms' }}>
        <CardHeader>
          <CardTitle className="text-lg">To-Do List</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Add Todo */}
          <div className="flex space-x-2">
            <Input
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new task..."
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              className="flex-1"
            />
            <Button onClick={addTodo} className="hover-lift">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Todo List */}
          <div className="space-y-2">
            {dayData?.todos.length ? (
              dayData.todos.map((todo, index) => (
                <div 
                  key={todo.id} 
                  className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={() => toggleTodo(todo.id)}
                  />
                  <span className={`flex-1 ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {todo.text}
                  </span>
                  
                  {todo.reminder && (
                    <span className="text-xs text-muted-foreground flex items-center">
                      <Bell className="h-3 w-3 mr-1" />
                      {todo.reminder.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReminder(todo.id)}
                    className="hover-lift"
                  >
                    <Bell className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTodo(todo.id)}
                    className="hover-lift text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground italic text-center py-8">
                No tasks for this day yet.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}