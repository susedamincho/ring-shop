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
                    <h1 className="text-3xl font-bold">Настройки на базата данни</h1>
                </div>

                <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList>
                        <TabsTrigger value="initialization">Инициализация</TabsTrigger>
                        <TabsTrigger value="management">Управление на данни</TabsTrigger>
                        <TabsTrigger value="backup">Резервно копие и възстановяване</TabsTrigger>
                    </TabsList>

                    <TabsContent value="initialization" className="pt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Инициализация на базата данни</CardTitle>
                                <CardDescription>
                                    Инициализирайте базата данни с начални стойности. Изберете какви типове данни да се добавят.
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
                                <CardTitle>Управление на данни</CardTitle>
                                <CardDescription>Управлявайте записите в базата – добавяне, редактиране или изтриване.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <AdminDataManagement />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="backup" className="pt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Резервно копие и възстановяване</CardTitle>
                                <CardDescription>Създайте резервно копие на базата и възстановете от предишна версия.</CardDescription>
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
