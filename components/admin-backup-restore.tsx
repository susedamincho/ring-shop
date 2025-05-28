"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { collection, getDocs, doc, setDoc, addDoc, writeBatch } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { Download, Upload, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

const COLLECTIONS = [
    { id: "all", name: "Всички колекции" },
    { id: "categories", name: "Категории" },
    { id: "brands", name: "Марки" },
    { id: "conditions", name: "Състояния" },
    { id: "storageOptions", name: "Опции за памет" },
    { id: "carriers", name: "Оператори" },
    { id: "colors", name: "Цветове" },
    { id: "products", name: "Продукти" },
    { id: "orders", name: "Поръчки" },
]

export default function AdminBackupRestore() {
    const { toast } = useToast()
    const [selectedCollection, setSelectedCollection] = useState("all")
    const [loading, setLoading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
    const [activeTab, setActiveTab] = useState("export")
    const [replaceExisting, setReplaceExisting] = useState(false)
    const [preserveIds, setPreserveIds] = useState(true)

    const handleExport = async () => {
        try {
            setLoading(true)
            setProgress(0)
            setResult(null)

            const collectionsToExport =
                selectedCollection === "all" ? COLLECTIONS.filter((c) => c.id !== "all").map((c) => c.id) : [selectedCollection]

            const exportData: Record<string, any[]> = {}
            let processedCollections = 0

            for (const collectionId of collectionsToExport) {
                const snapshot = await getDocs(collection(db, collectionId))
                exportData[collectionId] = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }))
                processedCollections++
                setProgress(Math.round((processedCollections / collectionsToExport.length) * 100))
            }

            const processedData = JSON.stringify(
                exportData,
                (key, value) => {
                    if (value && typeof value === "object" && value.seconds !== undefined && value.nanoseconds !== undefined) {
                        return new Date(value.seconds * 1000).toISOString()
                    }
                    return value
                },
                2,
            )

            const blob = new Blob([processedData], { type: "application/json" })
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.download = `${selectedCollection === "all" ? "database" : selectedCollection}-backup-${new Date().toISOString().split("T")[0]}.json`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            setResult({ success: true, message: `Успешно експортиране на ${selectedCollection === "all" ? "всички колекции" : selectedCollection}.` })

            toast({
                title: "Успешен експорт",
                description: "Данните са експортирани в JSON файл.",
            })
        } catch (error) {
            console.error("Грешка при експортиране:", error)
            setResult({ success: false, message: `Неуспешен експорт: ${error instanceof Error ? error.message : String(error)}` })

            toast({
                title: "Грешка при експортиране",
                description: "Възникна грешка при експортирането. Опитайте отново.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
            setProgress(100)
        }
    }

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        try {
            setLoading(true)
            setProgress(0)
            setResult(null)

            const fileContent = await file.text()
            const importData = JSON.parse(fileContent)

            if (typeof importData !== "object") {
                throw new Error("Невалиден формат на файла.")
            }

            const collectionsToImport = selectedCollection === "all" ? Object.keys(importData) : [selectedCollection]

            let totalItems = 0
            let processedItems = 0

            for (const collectionId of collectionsToImport) {
                if (Array.isArray(importData[collectionId])) {
                    totalItems += importData[collectionId].length
                }
            }

            for (const collectionId of collectionsToImport) {
                if (!Array.isArray(importData[collectionId])) continue

                const items = importData[collectionId]

                if (replaceExisting) {
                    const snapshot = await getDocs(collection(db, collectionId))
                    const batchSize = 500
                    let batch = writeBatch(db)
                    let count = 0

                    for (const doc of snapshot.docs) {
                        batch.delete(doc.ref)
                        count++
                        if (count >= batchSize) {
                            await batch.commit()
                            batch = writeBatch(db)
                            count = 0
                        }
                    }

                    if (count > 0) await batch.commit()
                }

                for (const item of items) {
                    const { id, ...data } = item
                    if (preserveIds && id) {
                        await setDoc(doc(db, collectionId, id), data)
                    } else {
                        await addDoc(collection(db, collectionId), data)
                    }

                    processedItems++
                    setProgress(Math.round((processedItems / totalItems) * 100))
                }
            }

            setResult({ success: true, message: `Успешен импорт на ${processedItems} елемента.` })

            toast({
                title: "Успешен импорт",
                description: `${processedItems} елемента са импортирани успешно.`,
            })

            event.target.value = ""
        } catch (error) {
            console.error("Грешка при импортиране:", error)
            setResult({ success: false, message: `Неуспешен импорт: ${error instanceof Error ? error.message : String(error)}` })

            toast({
                title: "Грешка при импортиране",
                description: "Проблем с файла. Проверете формата и опитайте отново.",
                variant: "destructive",
            })

            event.target.value = ""
        } finally {
            setLoading(false)
            setProgress(100)
        }
    }

    return (
        <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="export">Експортиране</TabsTrigger>
                    <TabsTrigger value="import">Импортиране</TabsTrigger>
                </TabsList>

                <TabsContent value="export" className="space-y-6 pt-4">
                    <div className="flex items-center space-x-4">
                        <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                            <SelectTrigger className="w-[250px]">
                                <SelectValue placeholder="Изберете колекция" />
                            </SelectTrigger>
                            <SelectContent>
                                {COLLECTIONS.map((collection) => (
                                    <SelectItem key={collection.id} value={collection.id}>
                                        {collection.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button onClick={handleExport} disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                            Експортирай {selectedCollection === "all" ? "всички данни" : COLLECTIONS.find((c) => c.id === selectedCollection)?.name}
                        </Button>
                    </div>

                    {loading && (
                        <div className="space-y-2">
                            <Progress value={progress} />
                            <p className="text-sm text-muted-foreground text-center">Експортиране... {progress}%</p>
                        </div>
                    )}

                    {result && (
                        <Alert variant={result.success ? "default" : "destructive"}>
                            {result.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                            <AlertTitle>{result.success ? "Успех" : "Грешка"}</AlertTitle>
                            <AlertDescription>{result.message}</AlertDescription>
                        </Alert>
                    )}

                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="text-lg font-medium mb-2">Инструкции за експортиране</h3>
                            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                                <li>Изберете конкретна колекция или "Всички колекции"</li>
                                <li>Натиснете "Експортирай", за да изтеглите JSON файл</li>
                                <li>Файлът ще съдържа всички документи от избраните колекции</li>
                                <li>Датите ще бъдат в ISO формат за съвместимост</li>
                            </ul>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="import" className="space-y-6 pt-4">
                    <div className="flex items-center space-x-4">
                        <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                            <SelectTrigger className="w-[250px]">
                                <SelectValue placeholder="Изберете колекция" />
                            </SelectTrigger>
                            <SelectContent>
                                {COLLECTIONS.map((collection) => (
                                    <SelectItem key={collection.id} value={collection.id}>
                                        {collection.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="relative">
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImport}
                                disabled={loading}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <Button disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                Импортирай {selectedCollection === "all" ? "всички данни" : COLLECTIONS.find((c) => c.id === selectedCollection)?.name}
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center space-x-8">
                        <div className="flex items-center space-x-2">
                            <Switch id="replace-existing" checked={replaceExisting} onCheckedChange={setReplaceExisting} />
                            <Label htmlFor="replace-existing">Замени съществуващите данни</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch id="preserve-ids" checked={preserveIds} onCheckedChange={setPreserveIds} />
                            <Label htmlFor="preserve-ids">Запази ID-тата</Label>
                        </div>
                    </div>

                    {loading && (
                        <div className="space-y-2">
                            <Progress value={progress} />
                            <p className="text-sm text-muted-foreground text-center">Импортиране... {progress}%</p>
                        </div>
                    )}

                    {result && (
                        <Alert variant={result.success ? "default" : "destructive"}>
                            {result.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                            <AlertTitle>{result.success ? "Успех" : "Грешка"}</AlertTitle>
                            <AlertDescription>{result.message}</AlertDescription>
                        </Alert>
                    )}

                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="text-lg font-medium mb-2">Инструкции за импортиране</h3>
                            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                                <li>Изберете колекция или "Всички колекции"</li>
                                <li>Изберете дали да замените съществуващи данни</li>
                                <li>Изберете дали да запазите ID-тата</li>
                                <li>Изберете JSON файл, експортиран от тази система</li>
                                <li>Форматът трябва да е валиден (име на колекция → масив от обекти)</li>
                            </ul>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
