'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Type, Trophy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useBookStore } from '@/lib/book-store';
import { toast } from 'sonner';

// Fragen-Schema, wie es die /api/quiz-Route liefert
interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const ReadingQuiz = ({
  bookId,
  chapterTitle,
  chapterContent,
  open,
  onOpenChange,
}: {
  bookId: string;
  chapterTitle?: string;
  chapterContent: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { addQuizResult } = useBookStore();
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  const generateQuiz = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterContent, chapterTitle }),
      });
      
      const data = await response.json();
      
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions.map((q: any, i: number) => ({
          id: q.id || `q-${i}`,
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation,
        })));
        setAnswers([]);
        setCurrentQuestion(0);
        setShowResults(false);
      }
    } catch (error) {
      console.error('Quiz generation error:', error);
      toast.error('Quiz konnte nicht generiert werden');
    }
    setLoading(false);
  };

  const answerQuestion = (answerIndex: number) => {
    const newAnswers = [...answers, answerIndex];
    setAnswers(newAnswers);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Quiz complete
      const score = newAnswers.filter((a, i) => a === questions[i].correctIndex).length;
      addQuizResult({
        bookId,
        chapter: chapterTitle,
        questions,
        answers: newAnswers,
        score,
        totalQuestions: questions.length,
        completedAt: Date.now(),
      });
      setShowResults(true);
    }
  };

  const restartQuiz = () => {
    setAnswers([]);
    setCurrentQuestion(0);
    setShowResults(false);
  };

  useEffect(() => {
    if (open && questions.length === 0) {
      generateQuiz();
    }
  }, [open]);

  const score = answers.filter((a, i) => a === questions[i]?.correctIndex).length;
  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Lese-Quiz {chapterTitle && `: ${chapterTitle}`}
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] p-4">
          {loading ? (
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Quiz wird generiert...</p>
            </div>
          ) : showResults ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 max-w-md"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center mx-auto">
                <Trophy className={`w-12 h-12 ${percentage >= 70 ? 'text-yellow-500' : percentage >= 50 ? 'text-blue-500' : 'text-gray-500'}`} />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{score} / {questions.length}</h3>
                <p className="text-muted-foreground">{percentage}% richtig</p>
              </div>
              <Progress value={percentage} className="h-3 w-48 mx-auto" />
              <p className="text-sm text-muted-foreground">
                {percentage >= 70 ? 'Ausgezeichnet! Sie haben das Kapitel gut verstanden.' :
                 percentage >= 50 ? 'Gut gemacht! Vielleicht möchten Sie einige Passagen noch einmal lesen.' :
                 'Vielleicht möchten Sie das Kapitel noch einmal lesen.'}
              </p>
              
              {/* Show question review */}
              <ScrollArea className="max-h-48 w-full">
                <div className="space-y-2">
                  {questions.map((q, i) => (
                    <div key={q.id} className={`p-2 rounded text-left text-sm ${answers[i] === q.correctIndex ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                      <p className="font-medium">{q.question}</p>
                      <p className="text-xs text-muted-foreground">
                        Ihre Antwort: {q.options[answers[i]]}
                        {answers[i] !== q.correctIndex && ` | Richtig: ${q.options[q.correctIndex]}`}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={restartQuiz}>Nochmal</Button>
                <Button onClick={() => onOpenChange(false)}>Schließen</Button>
              </div>
            </motion.div>
          ) : questions.length > 0 ? (
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full max-w-md space-y-6"
            >
              <div className="text-center">
                <Badge variant="secondary">Frage {currentQuestion + 1} von {questions.length}</Badge>
              </div>
              
              <Card>
                <CardContent className="p-6">
                  <p className="text-lg font-medium text-center mb-6">
                    {questions[currentQuestion].question}
                  </p>
                  <div className="space-y-2">
                    {questions[currentQuestion].options.map((option, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        className="w-full justify-start h-auto py-3 px-4"
                        onClick={() => answerQuestion(i)}
                      >
                        <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
                        {option}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Progress value={(currentQuestion / questions.length) * 100} className="h-2" />
            </motion.div>
          ) : (
            <div className="text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Kein Quiz verfügbar</p>
              <Button className="mt-4" onClick={generateQuiz}>Quiz generieren</Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
