"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AdminInitDb from "@/components/admin-init-db"
import AdminDataManagement from "@/components/admin-data-management"
import AdminBackupRestore from "@/components/admin-backup-restore"
import ProtectedRoute from "@/components/protected-route"

export default function DatabaseSettingsPage() {
    const [activeTab, setActiveTab] = useState("initialization")

    return (
        <ProtectedRoute adminOnly>
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Database Settings</h1>
                </div>

                <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList>
                        <TabsTrigger value="initialization">Initialization</TabsTrigger>
                        <TabsTrigger value="management">Data Management</TabsTrigger>
                        <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
                    </TabsList>

                    <TabsContent value="initialization" className="pt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Database Initialization</CardTitle>
                                <CardDescription>
                                    Initialize your database with default data. You can choose what type of data to add.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <AdminInitDb />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="management" className="pt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Data Management</CardTitle>
                                <CardDescription>Manage your database entries. Add, edit, or delete data.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <AdminDataManagement />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="backup" className="pt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Backup & Restore</CardTitle>
                                <CardDescription>Create backups of your database and restore from previous backups.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <AdminBackupRestore />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </ProtectedRoute>
    )
}
