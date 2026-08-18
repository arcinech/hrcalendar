"use client"

export default async function HealthPage() {

    let data = await fetch("/api/v1/health").then(res => res.json())



    return {

    }
}