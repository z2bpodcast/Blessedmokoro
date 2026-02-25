'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Trash2, Save, ArrowLeft, FileText, Image, FileAudio, Video, Upload } from 'lucide-react'

type ContentType = 'text' | 'image' | 'pdf' | 'audio' | 'video'

type Question = {
  id: string
  question: string
  options: string[]
  correct_answer: string
}

type Exercise = {
  id: string
  exercise_title: string
  instructions: string
  deadline: string
}

export default function CreateWorkshopPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [contentType, setContentType] = useState<ContentType>('text')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [isWorkshop, setIsWorkshop] = useState(true)
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  // Questions state
  const [questions, setQuestions] = useState<Question[]>([])
  
  // Exercises state
  const [exercises, setExercises] = useState<Exercise[]>([])

  // Add question
  const addQuestion = () => {
    setQuestions([...questions, {
      id: Date.now().toString(),
      question: '',
      options: ['', '', '', ''],
      correct_answer: ''
    }])
  }

  // Remove question
  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id))
  }

  // Update question
  const updateQuestion = (id: string, field: string, value: any) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ))
  }

  // Update question option
  const updateQuestionOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options]
        newOptions[optionIndex] = value
        return { ...q, options: newOptions }
      }
      return q
    }))
  }

  // Add exercise
  const addExercise = () => {
    setExercises([...exercises, {
      id: Date.now().toString(),
      exercise_title: '',
      instructions: '',
      deadline: ''
    }])
  }

  // Remove exercise
  const removeExercise = (id: string) => {
    setExercises(exercises.filter(e => e.id !== id))
  }

  // Update exercise
  const updateExercise = (id: string, field: string, value: string) => {
    setExercises(exercises.map(e => 
      e.id === id ? { ...e, [field]: value } : e
    ))
  }

  // Upload file to Supabase Storage
  const uploadFile = async (file: File, bucket: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${fileName}`

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error: any) {
      console.error('Upload error:', error)
      setError(`Upload failed: ${error.message}`)
      return null
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Upload media file if present
      let mediaUrl = null
      let thumbnailUrl = null

      if (mediaFile) {
        setUploading(true)
        mediaUrl = await uploadFile(mediaFile, 'workshop-media')
        if (!mediaUrl) throw new Error('Failed to upload media file')
      }

      if (thumbnailFile) {
        thumbnailUrl = await uploadFile(thumbnailFile, 'workshop-thumbnails')
      }
      
      setUploading(false)

      // Create post
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content_type: contentType,
          title,
          content,
          media_url: mediaUrl,
          thumbnail_url: thumbnailUrl,
          is_public: isPublic,
          is_workshop: isWorkshop
        })
        .select()
        .single()

      if (postError) throw postError

      // Add questions if any
      if (questions.length > 0 && isWorkshop) {
        const questionsToInsert = questions
          .filter(q => q.question.trim() !== '')
          .map((q, index) => ({
            post_id: post.id,
            question: q.question,
            options: q.options.filter(opt => opt.trim() !== ''),
            correct_answer: q.correct_answer,
            order_index: index
          }))

        if (questionsToInsert.length > 0) {
          const { error: questionsError } = await supabase
            .from('workshop_questions')
            .insert(questionsToInsert)

          if (questionsError) throw questionsError
        }
      }

      // Add exercises if any
      if (exercises.length > 0 && isWorkshop) {
        const exercisesToInsert = exercises
          .filter(e => e.exercise_title.trim() !== '')
          .map(e => ({
            post_id: post.id,
            exercise_title: e.exercise_title,
            instructions: e.instructions,
            deadline: e.deadline || null
          }))

        if (exercisesToInsert.length > 0) {
          const { error: exercisesError } = await supabase
            .from('daily_exercises')
            .insert(exercisesToInsert)

          if (exercisesError) throw exercisesError
        }
      }

      setSuccess('Workshop created successfully!')
      setTimeout(() => {
        router.push('/admin/workshops')
      }, 2000)

    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const getContentTypeIcon = (type: ContentType) => {
    switch (type) {
      case 'text': return <FileText className="w-5 h-5" />
      case 'image': return <Image className="w-5 h-5" />
      case 'pdf': return <FileText className="w-5 h-5" />
      case 'audio': return <FileAudio className="w-5 h-5" />
      case 'video': return <Video className="w-5 h-5" />
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-royal-gradient shadow-xl border-b-4 border-gold-400">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <img src="/logo.jpg" alt="Z2B Logo" className="h-16 w-16 rounded-xl border-2 border-gold-400 shadow-lg" />
              <div>
                <h1 className="text-2xl font-bold text-white">Z2B TABLE BANQUET</h1>
                <p className="text-sm text-gold-300">Create Workshop</p>
              </div>
            </div>
            <Link href="/admin" className="bg-white text-primary-700 hover:bg-gold-50 font-semibold py-2 px-6 rounded-lg transition-colors border-2 border-gold-400 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Admin
            </Link>
          </div>
        </nav>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card border-4 border-primary-600 shadow-2xl">
          <h2 className="text-3xl font-bold text-primary-800 mb-6">Create New Workshop</h2>

          {error && (
            <div className="bg-red-50 border-2 border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-2 border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-primary-800 border-b-2 border-primary-200 pb-2">
                Basic Information
              </h3>

              {/* Content Type */}
              <div>
                <label className="block text-sm font-bold text-primary-800 mb-2">
                  Content Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {(['text', 'image', 'pdf', 'audio', 'video'] as ContentType[]).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setContentType(type)}
                      className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 font-semibold transition-all ${
                        contentType === type
                          ? 'bg-royal-gradient text-white border-gold-400'
                          : 'bg-white text-primary-700 border-primary-300 hover:border-primary-500'
                      }`}
                    >
                      {getContentTypeIcon(type)}
                      <span className="capitalize">{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-bold text-primary-800 mb-1">
                  Workshop Title
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field"
                  placeholder="e.g., Introduction to Entrepreneurship"
                />
              </div>

              {/* Content */}
              <div>
                <label htmlFor="content" className="block text-sm font-bold text-primary-800 mb-1">
                  Description / Content
                </label>
                <textarea
                  id="content"
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="input-field min-h-[150px]"
                  placeholder="Enter the main content or description of this workshop..."
                />
              </div>

              {/* Media Upload */}
              {contentType !== 'text' && (
                <div>
                  <label className="block text-sm font-bold text-primary-800 mb-1">
                    Upload {contentType === 'image' ? 'Image' : contentType === 'pdf' ? 'PDF' : contentType === 'audio' ? 'Audio' : 'Video'} File
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 bg-white border-2 border-primary-300 hover:border-primary-500 text-primary-700 font-semibold py-2 px-6 rounded-lg cursor-pointer transition-all">
                      <Upload className="w-5 h-5" />
                      <span>Choose File</span>
                      <input
                        type="file"
                        accept={
                          contentType === 'image' ? 'image/*' :
                          contentType === 'pdf' ? 'application/pdf' :
                          contentType === 'audio' ? 'audio/*' :
                          'video/*'
                        }
                        onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                    {mediaFile && (
                      <span className="text-sm text-primary-600">{mediaFile.name}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Thumbnail Upload (for videos) */}
              {contentType === 'video' && (
                <div>
                  <label className="block text-sm font-bold text-primary-800 mb-1">
                    Video Thumbnail (Optional)
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 bg-white border-2 border-primary-300 hover:border-primary-500 text-primary-700 font-semibold py-2 px-6 rounded-lg cursor-pointer transition-all">
                      <Image className="w-5 h-5" />
                      <span>Choose Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                    {thumbnailFile && (
                      <span className="text-sm text-primary-600">{thumbnailFile.name}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Toggles */}
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isWorkshop"
                    checked={isWorkshop}
                    onChange={(e) => setIsWorkshop(e.target.checked)}
                    className="w-5 h-5 text-primary-600 rounded border-primary-300"
                  />
                  <label htmlFor="isWorkshop" className="text-sm font-bold text-primary-800">
                    This is a Workshop (with questions & exercises)
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="w-5 h-5 text-primary-600 rounded border-primary-300"
                  />
                  <label htmlFor="isPublic" className="text-sm font-bold text-primary-800">
                    Public (visible to all users)
                  </label>
                </div>
              </div>
            </div>

            {/* Comprehension Questions */}
            {isWorkshop && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b-2 border-primary-200 pb-2">
                  <h3 className="text-2xl font-bold text-primary-800">
                    Comprehension Questions
                  </h3>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="flex items-center gap-2 bg-royal-gradient text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <Plus className="w-5 h-5" />
                    Add Question
                  </button>
                </div>

                {questions.length === 0 && (
                  <p className="text-primary-600 text-center py-4">
                    No questions added yet. Click "Add Question" to create one.
                  </p>
                )}

                {questions.map((q, index) => (
                  <div key={q.id} className="p-6 bg-primary-50 rounded-xl border-2 border-primary-200">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="text-lg font-bold text-primary-800">Question {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeQuestion(q.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-primary-800 mb-1">
                          Question
                        </label>
                        <input
                          type="text"
                          value={q.question}
                          onChange={(e) => updateQuestion(q.id, 'question', e.target.value)}
                          className="input-field"
                          placeholder="Enter your question..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-primary-800 mb-2">
                          Options
                        </label>
                        <div className="space-y-2">
                          {q.options.map((option, optIndex) => (
                            <input
                              key={optIndex}
                              type="text"
                              value={option}
                              onChange={(e) => updateQuestionOption(q.id, optIndex, e.target.value)}
                              className="input-field"
                              placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-primary-800 mb-1">
                          Correct Answer
                        </label>
                        <select
                          value={q.correct_answer}
                          onChange={(e) => updateQuestion(q.id, 'correct_answer', e.target.value)}
                          className="input-field"
                        >
                          <option value="">Select correct answer</option>
                          {q.options.map((option, optIndex) => (
                            option.trim() && (
                              <option key={optIndex} value={option}>
                                {String.fromCharCode(65 + optIndex)}: {option}
                              </option>
                            )
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Daily Exercises */}
            {isWorkshop && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b-2 border-primary-200 pb-2">
                  <h3 className="text-2xl font-bold text-primary-800">
                    Daily Exercises
                  </h3>
                  <button
                    type="button"
                    onClick={addExercise}
                    className="flex items-center gap-2 bg-royal-gradient text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <Plus className="w-5 h-5" />
                    Add Exercise
                  </button>
                </div>

                {exercises.length === 0 && (
                  <p className="text-primary-600 text-center py-4">
                    No exercises added yet. Click "Add Exercise" to create one.
                  </p>
                )}

                {exercises.map((ex, index) => (
                  <div key={ex.id} className="p-6 bg-green-50 rounded-xl border-2 border-green-200">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="text-lg font-bold text-primary-800">Exercise {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeExercise(ex.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-primary-800 mb-1">
                          Exercise Title
                        </label>
                        <input
                          type="text"
                          value={ex.exercise_title}
                          onChange={(e) => updateExercise(ex.id, 'exercise_title', e.target.value)}
                          className="input-field"
                          placeholder="e.g., Create Your Business Plan"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-primary-800 mb-1">
                          Instructions
                        </label>
                        <textarea
                          value={ex.instructions}
                          onChange={(e) => updateExercise(ex.id, 'instructions', e.target.value)}
                          className="input-field min-h-[100px]"
                          placeholder="Provide detailed instructions for this exercise..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-primary-800 mb-1">
                          Deadline (Optional)
                        </label>
                        <input
                          type="datetime-local"
                          value={ex.deadline}
                          onChange={(e) => updateExercise(ex.id, 'deadline', e.target.value)}
                          className="input-field"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4 pt-6 border-t-2 border-primary-200">
              <button
                type="submit"
                disabled={loading || uploading}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading || uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>{uploading ? 'Uploading...' : 'Creating...'}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Create Workshop</span>
                  </>
                )}
              </button>
              <Link
                href="/admin"
                className="px-8 py-3 bg-white border-2 border-primary-300 text-primary-700 font-semibold rounded-lg hover:border-primary-500 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}