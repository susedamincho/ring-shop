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
    { id: "all", name: "All Collections" },
    { id: "categories", name: "Categories" },
    { id: "brands", name: "Brands" },
    { id: "conditions", name: "Conditions" },
    { id: "storageOptions", name: "Storage Options" },
    { id: "carriers", name: "Carriers" },
    { id: "colors", name: "Colors" },
    { id: "products", name: "Products" },
    { id: "orders", name: "Orders" },
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

    // Export data
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
                // Skip if collection is "all"
                if (collectionId === "all") continue

                const collectionRef = collection(db, collectionId)
                const snapshot = await getDocs(collectionRef)

                exportData[collectionId] = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }))

                processedCollections++
                setProgress(Math.round((processedCollections / collectionsToExport.length) * 100))
            }

            // Convert timestamps to ISO strings for JSON serialization
            const processedData = JSON.stringify(
                exportData,
                (key, value) => {
                    // Check if the value is a Firebase timestamp
                    if (value && typeof value === "object" && value.seconds !== undefined && value.nanoseconds !== undefined) {
                        return new Date(value.seconds * 1000).toISOString()
                    }
                    return value
                },
                2,
            )

            // Create a blob and download link
            const blob = new Blob([processedData], { type: "application/json" })
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.download = `${selectedCollection === "all" ? "database" : selectedCollection}-backup-${new Date().toISOString().split("T")[0]}.json`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            setResult({
                success: true,
                message: `Successfully exported ${selectedCollection === "all" ? "all collections" : selectedCollection}.`,
            })

            toast({
                title: "Export Successful",
                description: `Data has been exported to a JSON file.`,
            })
        } catch (error) {
            console.error("Error exporting data:", error)
            setResult({
                success: false,
                message: `Failed to export data: ${error instanceof Error ? error.message : String(error)}`,
            })
            toast({
                title: "Export Failed",
                description: "There was an error exporting the data. Please try again.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
            setProgress(100)
        }
    }

    // Import data
    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        try {
            setLoading(true)
            setProgress(0)
            setResult(null)

            // Read the file
            const fileContent = await file.text()
            const importData = JSON.parse(fileContent)

            // Validate the data
            if (typeof importData !== "object") {
                throw new Error("Invalid import file format. Expected a JSON object.")
            }

            const collectionsToImport = selectedCollection === "all" ? Object.keys(importData) : [selectedCollection]

            let totalItems = 0
            let processedItems = 0

            // Count total items for progress tracking
            for (const collectionId of collectionsToImport) {
                if (importData[collectionId] && Array.isArray(importData[collectionId])) {
                    totalItems += importData[collectionId].length
                }
            }

            // Process each collection
            for (const collectionId of collectionsToImport) {
                // Skip if collection doesn't exist in import data
                if (!importData[collectionId] || !Array.isArray(importData[collectionId])) continue

                const items = importData[collectionId]

                // If replacing existing data, delete all documents in the collection first
                if (replaceExisting) {
                    const collectionRef = collection(db, collectionId)
                    const snapshot = await getDocs(collectionRef)

                    // Use batched writes for better performance
                    const batchSize = 500
                    let batch = writeBatch(db)
                    let operationCount = 0

                    for (const doc of snapshot.docs) {
                        batch.delete(doc.ref)
                        operationCount++

                        if (operationCount >= batchSize) {
                            await batch.commit()
                            batch = writeBatch(db)
                            operationCount = 0
                        }
                    }

                    if (operationCount > 0) {
                        await batch.commit()
                    }
                }

                // Add or update documents
                for (const item of items) {
                    const { id, ...data } = item

                    if (preserveIds && id) {
                        // Use the original ID
                        await setDoc(doc(db, collectionId, id), data)
                    } else {
                        // Generate a new ID
                        await addDoc(collection(db, collectionId), data)
                    }

                    processedItems++
                    setProgress(Math.round((processedItems / totalItems) * 100))
                }
            }

            setResult({
                success: true,
                message: `Successfully imported ${processedItems} items into ${selectedCollection === "all" ? "all collections" : selectedCollection}.`,
            })

            toast({
                title: "Import Successful",
                description: `${processedItems} items have been imported.`,
            })

            // Reset the file input
            event.target.value = ""
        } catch (error) {
            console.error("Error importing data:", error)
            setResult({
                success: false,
                message: `Failed to import data: ${error instanceof Error ? error.message : String(error)}`,
            })
            toast({
                title: "Import Failed",
                description: "There was an error importing the data. Please check the file format and try again.",
                variant: "destructive",
            })

            // Reset the file input
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
                    <TabsTrigger value="export">Export Data</TabsTrigger>
                    <TabsTrigger value="import">Import Data</TabsTrigger>
                </TabsList>

                <TabsContent value="export" className="space-y-6 pt-4">
                    <div className="flex items-center space-x-4">
                        <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                            <SelectTrigger className="w-[250px]">
                                <SelectValue placeholder="Select collection" />
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
                            Export{" "}
                            {selectedCollection === "all" ? "All Data" : COLLECTIONS.find((c) => c.id === selectedCollection)?.name}
                        </Button>
                    </div>

                    {loading && (
                        <div className="space-y-2">
                            <Progress value={progress} />
                            <p className="text-sm text-muted-foreground text-center">Exporting data... {progress}%</p>
                        </div>
                    )}

                    {result && (
                        <Alert variant={result.success ? "default" : "destructive"}>
                            {result.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                            <AlertTitle>{result.success ? "Export Successful" : "Export Failed"}</AlertTitle>
                            <AlertDescription>{result.message}</AlertDescription>
                        </Alert>
                    )}

                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="text-lg font-medium mb-2">Export Instructions</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Export your database data to a JSON file for backup or migration purposes.
                            </p>
                            <ul className="list-disc pl-5 space-y-2 text-sm">
                                <li>Select a specific collection or "All Collections" to export</li>
                                <li>Click the Export button to download a JSON file</li>
                                <li>The exported file will include all documents in the selected collection(s)</li>
                                <li>Timestamps will be converted to ISO date strings for compatibility</li>
                            </ul>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="import" className="space-y-6 pt-4">
                    <div className="flex items-center space-x-4">
                        <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                            <SelectTrigger className="w-[250px]">
                                <SelectValue placeholder="Select collection" />
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
                                Import{" "}
                                {selectedCollection === "all" ? "All Data" : COLLECTIONS.find((c) => c.id === selectedCollection)?.name}
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center space-x-8">
                        <div className="flex items-center space-x-2">
                            <Switch id="replace-existing" checked={replaceExisting} onCheckedChange={setReplaceExisting} />
                            <Label htmlFor="replace-existing">Replace existing data</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch id="preserve-ids" checked={preserveIds} onCheckedChange={setPreserveIds} />
                            <Label htmlFor="preserve-ids">Preserve document IDs</Label>
                        </div>
                    </div>

                    {loading && (
                        <div className="space-y-2">
                            <Progress value={progress} />
                            <p className="text-sm text-muted-foreground text-center">Importing data... {progress}%</p>
                        </div>
                    )}

                    {result && (
                        <Alert variant={result.success ? "default" : "destructive"}>
                            {result.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                            <AlertTitle>{result.success ? "Import Successful" : "Import Failed"}</AlertTitle>
                            <AlertDescription>{result.message}</AlertDescription>
                        </Alert>
                    )}

                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="text-lg font-medium mb-2">Import Instructions</h3>
                            <p className="text-sm text-muted-foreground mb-4">Import data from a JSON file into your database.</p>
                            <ul className="list-disc pl-5 space-y-2 text-sm">
                                <li>Select a specific collection or "All Collections" to import</li>
                                <li>Choose whether to replace existing data or merge with it</li>
                                <li>Choose whether to preserve document IDs from the import file</li>
                                <li>Select a JSON file that was previously exported from this system</li>
                                <li>The file format should match the export format (collection name → array of documents)</li>
                            </ul>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
