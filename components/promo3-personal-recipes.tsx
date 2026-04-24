'use client'

import * as React from 'react'
import { z } from 'zod'
import { Heart, Search, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'

const STORAGE_KEY = 'itk_promo3_personal_recipes_v1'

const RecipeSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(80),
  description: z.string().max(240).optional().default(''),
  ingredients: z.string().min(1).max(4000),
  steps: z.string().min(1).max(8000),
  tags: z.array(z.string()).max(12).default([]),
  createdAt: z.string(),
})

type Recipe = z.infer<typeof RecipeSchema>

const NewRecipeSchema = RecipeSchema.omit({ id: true, createdAt: true }).extend({
  tagsCsv: z
    .string()
    .max(200)
    .optional()
    .default(''),
})

type NewRecipeForm = z.infer<typeof NewRecipeSchema>

function safeParseRecipes(raw: unknown): Recipe[] {
  if (!raw) return []
  const parsed = z.array(RecipeSchema).safeParse(raw)
  return parsed.success ? parsed.data : []
}

function normalizeTags(tagsCsv: string): string[] {
  const tags = tagsCsv
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => t.toLowerCase())
  return Array.from(new Set(tags)).slice(0, 12)
}

function usePromo3Recipes() {
  const [recipes, setRecipes] = React.useState<Recipe[]>([])

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const json = JSON.parse(raw) as unknown
      setRecipes(safeParseRecipes(json))
    } catch {
      // ignore corrupted storage; user can re-add recipes
    }
  }, [])

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes))
    } catch {
      // ignore quota errors
    }
  }, [recipes])

  return { recipes, setRecipes }
}

export function Promo3RecipesBrowse() {
  const { recipes, setRecipes } = usePromo3Recipes()
  const [query, setQuery] = React.useState('')

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return recipes

    return recipes.filter((r) => {
      const haystack = [
        r.title,
        r.description ?? '',
        r.ingredients,
        r.steps,
        r.tags.join(' '),
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [query, recipes])

  function onDelete(id: string) {
    setRecipes((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <main className="border-b border-border bg-gradient-to-b from-rose-500/10 to-background">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Join in on the fun!
              </h1>
            </div>
            <p className="max-w-3xl text-muted-foreground">
              Browse the collection and add your go-to recipes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button asChild className="rounded-full">
              <Link href="/promos/3/add-recipe">Add a recipe</Link>
            </Button>
          </div>
        </div>

        <div className="mt-8">
          <Card className="border-2 border-border">
            <CardHeader className="gap-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Browse recipes</CardTitle>
                  <CardDescription>
                    {recipes.length === 0 ? 'No recipes yet—add the first one.' : `${recipes.length} saved`}
                  </CardDescription>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search title, ingredients, tags..."
                    className="pl-9"
                  />
                </div>
              </div>
              <Separator />
            </CardHeader>

            <CardContent>
              <ScrollArea className="h-[560px] pr-3">
                <div className="space-y-3">
                  {filtered.length === 0 ? (
                    <div className="rounded-lg border border-border bg-secondary/20 px-4 py-6 text-sm text-muted-foreground">
                      No matches for <span className="font-medium text-foreground">{query.trim() || 'your search'}</span>.
                    </div>
                  ) : (
                    filtered.map((r) => (
                      <div key={r.id} className="rounded-xl border border-border bg-card p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-foreground">{r.title}</h3>
                              {r.tags.map((t) => (
                                <Badge key={t} variant="outline" className="rounded-full">
                                  {t}
                                </Badge>
                              ))}
                            </div>
                            {r.description ? (
                              <p className="text-sm text-muted-foreground">{r.description}</p>
                            ) : null}
                            <p className="text-xs text-muted-foreground">
                              Added {new Date(r.createdAt).toLocaleString()}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="rounded-full">
                                  View
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle className="flex flex-wrap items-center gap-2">
                                    {r.title}
                                    {r.tags.map((t) => (
                                      <Badge key={t} variant="secondary" className="rounded-full">
                                        {t}
                                      </Badge>
                                    ))}
                                  </DialogTitle>
                                  <DialogDescription>
                                    {r.description ? r.description : 'No description provided.'}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 sm:grid-cols-2">
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-semibold text-foreground">Ingredients</h4>
                                    <pre className="whitespace-pre-wrap rounded-md border border-border bg-secondary/20 p-3 text-sm">
                                      {r.ingredients}
                                    </pre>
                                  </div>
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-semibold text-foreground">Steps</h4>
                                    <pre className="whitespace-pre-wrap rounded-md border border-border bg-secondary/20 p-3 text-sm">
                                      {r.steps}
                                    </pre>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>

                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-muted-foreground hover:text-destructive"
                              onClick={() => onDelete(r.id)}
                              aria-label={`Delete ${r.title}`}
                            >
                              <Trash2 className="h-4 w-4" aria-hidden />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

export function Promo3AddRecipe() {
  const router = useRouter()
  const { setRecipes } = usePromo3Recipes()
  const [form, setForm] = React.useState<NewRecipeForm>({
    title: '',
    description: '',
    ingredients: '',
    steps: '',
    tags: [],
    tagsCsv: '',
  })
  const [error, setError] = React.useState<string | null>(null)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const candidate = {
      title: form.title.trim(),
      description: (form.description ?? '').trim(),
      ingredients: form.ingredients.trim(),
      steps: form.steps.trim(),
      tags: normalizeTags(form.tagsCsv ?? ''),
      tagsCsv: form.tagsCsv ?? '',
    }

    const parsed = NewRecipeSchema.safeParse(candidate)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Please check your recipe fields.')
      return
    }

    const recipe: Recipe = {
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title: parsed.data.title,
      description: parsed.data.description,
      ingredients: parsed.data.ingredients,
      steps: parsed.data.steps,
      tags: normalizeTags(parsed.data.tagsCsv ?? ''),
      createdAt: new Date().toISOString(),
    }

    setRecipes((prev) => [recipe, ...prev])
    router.push('/promos/3')
    router.refresh()
  }

  return (
    <main className="border-b border-border bg-gradient-to-b from-rose-500/10 to-background">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Add a recipe
              </h1>
              <Badge variant="secondary" className="rounded-full">
                Promo #3
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Add ingredients + steps. You’ll be redirected back to browse after saving.
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/promos/3">Back to recipes</Link>
          </Button>
        </div>

        <Card className="mt-8 border-2 border-border">
          <CardHeader>
            <CardTitle>Recipe details</CardTitle>
            <CardDescription>Add your ingredients and steps, then save.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="recipe-title">Title</Label>
                <Input
                  id="recipe-title"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Lemon garlic pasta"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipe-description">Description (optional)</Label>
                <Input
                  id="recipe-description"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="A quick weeknight favorite..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipe-ingredients">Ingredients</Label>
                <Textarea
                  id="recipe-ingredients"
                  value={form.ingredients}
                  onChange={(e) => setForm((p) => ({ ...p, ingredients: e.target.value }))}
                  placeholder={"- 200g spaghetti\n- 2 cloves garlic\n- 1 lemon\n- olive oil, salt, pepper"}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipe-steps">Steps</Label>
                <Textarea
                  id="recipe-steps"
                  value={form.steps}
                  onChange={(e) => setForm((p) => ({ ...p, steps: e.target.value }))}
                  placeholder={"1) Boil pasta\n2) Sauté garlic\n3) Toss with lemon + oil"}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipe-tags">Tags (comma-separated)</Label>
                <Input
                  id="recipe-tags"
                  value={form.tagsCsv}
                  onChange={(e) => setForm((p) => ({ ...p, tagsCsv: e.target.value }))}
                  placeholder="vegetarian, spicy, meal-prep"
                />
              </div>

              {error ? (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              ) : null}

              <div className="flex items-center gap-2">
                <Button type="submit" className="rounded-full">
                  Save recipe
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setForm({ title: '', description: '', ingredients: '', steps: '', tags: [], tagsCsv: '' })}
                >
                  Clear
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

