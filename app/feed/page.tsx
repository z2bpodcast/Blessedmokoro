'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  ThumbsUp, 
  Lightbulb,
  Sparkles,
  Send,
  FileText,
  Headphones,
  Video as VideoIcon,
  Image as ImageIcon,
  Lock,
  CheckCircle,
  ExternalLink
} from 'lucide-react'

type Post = {
  id: string
  user_id: string
  content_type: 'text' | 'image' | 'pdf' | 'audio' | 'video'
  title: string
  content: string
  media_url: string | null
  thumbnail_url: string | null
  is_public: boolean
  is_workshop: boolean
  created_at: string
  profiles?: {
    full_name: string
  }
}

type Question = {
  id: string
  post_id: string
  question: string
  options: string[]
  correct_answer: string
  order_index: number
}

type Exercise = {
  id: string
  post_id: string
  exercise_title: string
  instructions: string
  deadline: string | null
}

type Reaction = {
  id: string
  post_id: string
  user_id: string
  reaction_type: 'like' | 'love' | 'celebrate' | 'insightful'
}

type Comment = {
  id: string
  post_id: string
  user_id: string
  comment: string
  created_at: string
  profiles?: {
    full_name: string
  }
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [expandedPost, setExpandedPost] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Record<string, Question[]>>({})
  const [exercises, setExercises] = useState<Record<string, Exercise[]>>({})
  const [reactions, setReactions] = useState<Record<string, Reaction[]>>({})
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [commentText, setCommentText] = useState<Record<string, string>>({})
  const router = useRouter()

  useEffect(() => {
    checkUser()
    fetchPosts()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (full_name)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPosts(data || [])
      
      // Fetch reactions and comments for all posts
      if (data) {
        data.forEach(post => {
          fetchReactions(post.id)
          fetchComments(post.id)
        })
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchWorkshopDetails = async (postId: string) => {
    try {
      // Fetch questions
      const { data: questionsData } = await supabase
        .from('workshop_questions')
        .select('*')
        .eq('post_id', postId)
        .order('order_index')

      if (questionsData) {
        setQuestions(prev => ({ ...prev, [postId]: questionsData }))
      }

      // Fetch exercises
      const { data: exercisesData } = await supabase
        .from('daily_exercises')
        .select('*')
        .eq('post_id', postId)

      if (exercisesData) {
        setExercises(prev => ({ ...prev, [postId]: exercisesData }))
      }
    } catch (error) {
      console.error('Error fetching workshop details:', error)
    }
  }

  const fetchReactions = async (postId: string) => {
    try {
      const { data } = await supabase
        .from('post_reactions')
        .select('*')
        .eq('post_id', postId)

      if (data) {
        setReactions(prev => ({ ...prev, [postId]: data }))
      }
    } catch (error) {
      console.error('Error fetching reactions:', error)
    }
  }

  const fetchComments = async (postId: string) => {
    try {
      const { data } = await supabase
        .from('post_comments')
        .select(`
          *,
          profiles (full_name)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (data) {
        setComments(prev => ({ ...prev, [postId]: data }))
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const toggleExpand = (postId: string) => {
    if (expandedPost === postId) {
      setExpandedPost(null)
    } else {
      setExpandedPost(postId)
      if (!questions[postId]) {
        fetchWorkshopDetails(postId)
      }
    }
  }

  const handleReaction = async (postId: string, reactionType: 'like' | 'love' | 'celebrate' | 'insightful') => {
    if (!user) {
      router.push('/login')
      return
    }

    try {
      const postReactions = reactions[postId] || []
      const existingReaction = postReactions.find(r => r.user_id === user.id)

      if (existingReaction) {
        // Remove reaction
        await supabase
          .from('post_reactions')
          .delete()
          .eq('id', existingReaction.id)
      } else {
        // Add reaction
        await supabase
          .from('post_reactions')
          .insert({
            post_id: postId,
            user_id: user.id,
            reaction_type: reactionType
          })
      }

      fetchReactions(postId)
    } catch (error) {
      console.error('Error handling reaction:', error)
    }
  }

  const handleComment = async (postId: string) => {
    if (!user) {
      router.push('/login')
      return
    }

    const text = commentText[postId]
    if (!text?.trim()) return

    try {
      await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          comment: text
        })

      setCommentText(prev => ({ ...prev, [postId]: '' }))
      fetchComments(postId)
    } catch (error) {
      console.error('Error posting comment:', error)
    }
  }

  const getReactionCounts = (postId: string) => {
    const postReactions = reactions[postId] || []
    return {
      like: postReactions.filter(r => r.reaction_type === 'like').length,
      love: postReactions.filter(r => r.reaction_type === 'love').length,
      celebrate: postReactions.filter(r => r.reaction_type === 'celebrate').length,
      insightful: postReactions.filter(r => r.reaction_type === 'insightful').length,
      total: postReactions.length
    }
  }

  const hasUserReacted = (postId: string, reactionType?: string) => {
    if (!user) return false
    const postReactions = reactions[postId] || []
    if (reactionType) {
      return postReactions.some(r => r.user_id === user.id && r.reaction_type === reactionType)
    }
    return postReactions.some(r => r.user_id === user.id)
  }

  const shareToSocial = (platform: string, post: Post) => {
    const url = encodeURIComponent(window.location.origin + '/feed')
    const text = encodeURIComponent(`Check out this workshop: ${post.title}`)

    const urls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      whatsapp: `https://wa.me/?text=${text} ${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
    }

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400')
    }
  }

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video': return <VideoIcon className="w-5 h-5" />
      case 'audio': return <Headphones className="w-5 h-5" />
      case 'pdf': return <FileText className="w-5 h-5" />
      case 'image': return <ImageIcon className="w-5 h-5" />
      default: return <FileText className="w-5 h-5" />
    }
  }

  const getFirstName = (fullName: string) => {
    return fullName?.split(' ')[0] || 'Member'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-primary-600">Loading workshops...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-royal-gradient shadow-xl border-b-4 border-gold-400 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity">
              <img src="/logo.jpg" alt="Z2B Logo" className="h-16 w-16 rounded-xl border-2 border-gold-400 shadow-lg" />
              <div>
                <h1 className="text-2xl font-bold text-white">Z2B TABLE BANQUET</h1>
                <p className="text-sm text-gold-300">Workshop Feed</p>
              </div>
            </Link>
            <div className="flex gap-3">
              {user ? (
                <>
                  <Link href="/dashboard" className="bg-white text-primary-700 hover:bg-gold-50 font-semibold py-2 px-6 rounded-lg transition-colors border-2 border-gold-400">
                    Dashboard
                  </Link>
                  <Link href="/library" className="btn-primary">
                    Library
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="bg-white text-primary-700 hover:bg-gold-50 font-semibold py-2 px-6 rounded-lg transition-colors border-2 border-gold-400">
                    Sign In
                  </Link>
                  <Link href="/signup" className="btn-primary">
                    Join Now
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-primary-800 mb-2">Workshop Feed</h2>
          <div className="w-32 h-1 bg-gold-gradient mx-auto rounded-full mb-4"></div>
          <p className="text-primary-600">Learn, engage, and grow with our community</p>
        </div>

        {/* Posts */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="card text-center py-12 border-4 border-primary-300">
              <p className="text-primary-700 text-lg">No workshops available yet. Check back soon!</p>
            </div>
          ) : (
            posts.map(post => {
              const reactionCounts = getReactionCounts(post.id)
              const postComments = comments[post.id] || []
              
              return (
                <div key={post.id} className="card border-4 border-primary-200 hover:border-gold-400 transition-all">
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-royal-gradient flex items-center justify-center text-white font-bold border-2 border-gold-400">
                        {getFirstName(post.profiles?.full_name || 'Z2B')[0]}
                      </div>
                      <div>
                        <p className="font-bold text-primary-800">{post.profiles?.full_name || 'Z2B Team'}</p>
                        <p className="text-sm text-gray-600">{new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getContentIcon(post.content_type)}
                      <span className="text-sm font-semibold text-primary-700 capitalize">{post.content_type}</span>
                      {post.is_workshop && (
                        <span className="bg-gold-gradient text-white text-xs font-bold px-2 py-1 rounded-full">
                          WORKSHOP
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Post Title */}
                  <h3 className="text-2xl font-bold text-primary-800 mb-3">{post.title}</h3>

                  {/* Post Content */}
                  <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.content}</p>

                  {/* Media */}
                  {post.media_url && (
                    <div className="mb-4 rounded-lg overflow-hidden border-2 border-primary-200">
                      {post.content_type === 'image' && (
                        <img src={post.media_url} alt={post.title} className="w-full" />
                      )}
                      {post.content_type === 'video' && (
                        <video controls className="w-full" poster={post.thumbnail_url || undefined}>
                          <source src={post.media_url} />
                        </video>
                      )}
                      {post.content_type === 'audio' && (
                        <audio controls className="w-full">
                          <source src={post.media_url} />
                        </audio>
                      )}
                      {post.content_type === 'pdf' && (
                        <a 
                          href={post.media_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-4 bg-primary-50 hover:bg-primary-100 transition-colors"
                        >
                          <FileText className="w-6 h-6 text-primary-600" />
                          <span className="font-semibold text-primary-700">Open PDF Document</span>
                          <ExternalLink className="w-4 h-4 text-primary-600 ml-auto" />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Workshop Details Button */}
                  {post.is_workshop && (
                    <button
                      onClick={() => toggleExpand(post.id)}
                      className="w-full bg-primary-100 hover:bg-primary-200 text-primary-800 font-semibold py-3 px-4 rounded-lg transition-colors mb-4 flex items-center justify-center gap-2"
                    >
                      {expandedPost === post.id ? '▼' : '▶'} View Workshop Details (Questions & Exercises)
                    </button>
                  )}

                  {/* Expanded Workshop Content */}
                  {expandedPost === post.id && post.is_workshop && (
                    <div className="mb-4 p-4 bg-primary-50 rounded-lg border-2 border-primary-200">
                      {/* Questions */}
                      {questions[post.id] && questions[post.id].length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-lg font-bold text-primary-800 mb-3 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            Comprehension Questions
                          </h4>
                          <div className="space-y-4">
                            {questions[post.id].map((q, idx) => (
                              <div key={q.id} className="bg-white p-4 rounded-lg border-2 border-primary-200">
                                <p className="font-semibold text-primary-800 mb-2">
                                  {idx + 1}. {q.question}
                                </p>
                                <div className="space-y-2">
                                  {q.options.map((option, optIdx) => (
                                    <div key={optIdx} className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-gray-600">
                                        {String.fromCharCode(65 + optIdx)}.
                                      </span>
                                      <span className="text-gray-700">{option}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Exercises */}
                      {exercises[post.id] && exercises[post.id].length > 0 && (
                        <div>
                          <h4 className="text-lg font-bold text-primary-800 mb-3 flex items-center gap-2">
                            <Sparkles className="w-5 h-5" />
                            Daily Exercises
                          </h4>
                          <div className="space-y-4">
                            {exercises[post.id].map((ex) => (
                              <div key={ex.id} className="bg-white p-4 rounded-lg border-2 border-green-200">
                                <h5 className="font-bold text-primary-800 mb-2">{ex.exercise_title}</h5>
                                <p className="text-gray-700 mb-2">{ex.instructions}</p>
                                {ex.deadline && (
                                  <p className="text-sm text-gray-600">
                                    <strong>Deadline:</strong> {new Date(ex.deadline).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {!questions[post.id]?.length && !exercises[post.id]?.length && (
                        <p className="text-gray-600 text-center py-4">No questions or exercises for this workshop.</p>
                      )}
                    </div>
                  )}

                  {/* Reaction Bar */}
                  <div className="flex items-center justify-between py-3 border-y-2 border-gray-200 mb-3">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleReaction(post.id, 'like')}
                        className={`flex items-center gap-1 transition-colors ${
                          hasUserReacted(post.id, 'like') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                        }`}
                      >
                        <ThumbsUp className="w-5 h-5" />
                        <span className="text-sm font-semibold">{reactionCounts.like}</span>
                      </button>
                      <button
                        onClick={() => handleReaction(post.id, 'love')}
                        className={`flex items-center gap-1 transition-colors ${
                          hasUserReacted(post.id, 'love') ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
                        }`}
                      >
                        <Heart className="w-5 h-5" />
                        <span className="text-sm font-semibold">{reactionCounts.love}</span>
                      </button>
                      <button
                        onClick={() => handleReaction(post.id, 'celebrate')}
                        className={`flex items-center gap-1 transition-colors ${
                          hasUserReacted(post.id, 'celebrate') ? 'text-yellow-600' : 'text-gray-600 hover:text-yellow-600'
                        }`}
                      >
                        <Sparkles className="w-5 h-5" />
                        <span className="text-sm font-semibold">{reactionCounts.celebrate}</span>
                      </button>
                      <button
                        onClick={() => handleReaction(post.id, 'insightful')}
                        className={`flex items-center gap-1 transition-colors ${
                          hasUserReacted(post.id, 'insightful') ? 'text-purple-600' : 'text-gray-600 hover:text-purple-600'
                        }`}
                      >
                        <Lightbulb className="w-5 h-5" />
                        <span className="text-sm font-semibold">{reactionCounts.insightful}</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{postComments.length} comments</span>
                    </div>
                  </div>

                  {/* Comments */}
                  <div className="space-y-3 mb-4">
                    {postComments.map(comment => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">
                          {getFirstName(comment.profiles?.full_name || 'User')[0]}
                        </div>
                        <div className="flex-1 bg-gray-100 rounded-lg p-3">
                          <p className="font-semibold text-sm text-primary-800">{comment.profiles?.full_name || 'User'}</p>
                          <p className="text-gray-700">{comment.comment}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(comment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Comment Input */}
                  {user ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={commentText[post.id] || ''}
                        onChange={(e) => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyPress={(e) => e.key === 'Enter' && handleComment(post.id)}
                        placeholder="Write a comment..."
                        className="input-field flex-1"
                      />
                      <button
                        onClick={() => handleComment(post.id)}
                        className="btn-primary px-4"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-primary-50 rounded-lg">
                      <Link href="/login" className="text-primary-700 font-semibold hover:text-gold-600">
                        Sign in to comment
                      </Link>
                    </div>
                  )}

                  {/* Share Buttons */}
                  <div className="mt-4 pt-4 border-t-2 border-gray-200">
                    <p className="text-sm font-semibold text-gray-600 mb-2">Share this workshop:</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => shareToSocial('facebook', post)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                      >
                        Facebook
                      </button>
                      <button
                        onClick={() => shareToSocial('whatsapp', post)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                      >
                        WhatsApp
                      </button>
                      <button
                        onClick={() => shareToSocial('twitter', post)}
                        className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                      >
                        Twitter
                      </button>
                      <button
                        onClick={() => shareToSocial('linkedin', post)}
                        className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                      >
                        LinkedIn
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}