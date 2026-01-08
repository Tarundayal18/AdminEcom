"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react"

interface Blog {
  id: string
  title: string
  description: string
  content: string
  status: "draft" | "published"
  date: string
}

export function BlogManagement() {
  const [blogs, setBlogs] = useState<Blog[]>([
    {
      id: "1",
      title: "Getting Started with B2B",
      description: "A comprehensive guide to B2B sales",
      content: "Lorem ipsum dolor sit amet...",
      status: "published",
      date: "2024-01-10",
    },
    {
      id: "2",
      title: "Best Practices for Enterprise",
      description: "Enterprise management tips",
      content: "Lorem ipsum dolor sit amet...",
      status: "draft",
      date: "2024-01-12",
    },
  ])

  const [formData, setFormData] = useState({ title: "", description: "", content: "" })
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      setBlogs(
        blogs.map((b) =>
          b.id === editingId
            ? {
                ...b,
                title: formData.title || b.title,
                description: formData.description || b.description,
                content: formData.content || b.content,
              }
            : b,
        ),
      )
      setEditingId(null)
    } else {
      const newBlog: Blog = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        content: formData.content,
        status: "draft",
        date: new Date().toISOString().split("T")[0],
      }
      setBlogs([...blogs, newBlog])
    }
    setFormData({ title: "", description: "", content: "" })
  }

  const deleteBlog = (id: string) => {
    setBlogs(blogs.filter((b) => b.id !== id))
  }

  const toggleStatus = (id: string) => {
    setBlogs(blogs.map((b) => (b.id === id ? { ...b, status: b.status === "draft" ? "published" : "draft" } : b)))
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Blog Management</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Create and manage blog posts</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="dark:bg-slate-900 dark:border-slate-800 max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Blog Post" : "Create New Blog Post"}</DialogTitle>
              <DialogDescription>
                {editingId ? "Update blog post details" : "Add a new blog post to publish"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="Enter blog title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="dark:bg-slate-800 dark:border-slate-700"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Short Description</label>
                <Input
                  placeholder="Brief description for preview"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="dark:bg-slate-800 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  placeholder="Write your blog content here..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="dark:bg-slate-800 dark:border-slate-700 min-h-40"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-cyan-600">
                {editingId ? "Update Post" : "Create Post"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="dark:border-slate-800">
        <CardHeader>
          <CardTitle>All Blog Posts</CardTitle>
          <CardDescription>Manage your blog content</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="dark:border-slate-800">
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blogs.map((blog) => (
                <TableRow key={blog.id} className="dark:border-slate-800">
                  <TableCell className="font-medium text-slate-900 dark:text-white">{blog.title}</TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300 text-sm max-w-xs truncate">
                    {blog.description}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300 text-sm">{blog.date}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        blog.status === "published"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                      }
                    >
                      {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingId(blog.id)
                          setFormData({
                            title: blog.title,
                            description: blog.description,
                            content: blog.content,
                          })
                        }}
                        className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleStatus(blog.id)}
                        className="text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        {blog.status === "published" ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteBlog(blog.id)}
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
