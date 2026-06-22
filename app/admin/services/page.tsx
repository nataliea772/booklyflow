"use client";

import { type FormEvent, useEffect, useState } from "react";
import AdminNav from "@/components/AdminNav";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Card, { CardHeader } from "@/components/Card";
import { useServices } from "@/hooks/useServices";
import type { Service } from "@/lib/types";

export default function ServicesPage() {
  const { services: loadedServices } = useServices();
  const [serviceList, setServiceList] = useState<Service[]>(loadedServices);

  useEffect(() => {
    setServiceList(loadedServices);
  }, [loadedServices]);

  function handleAddService(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const newService: Service = {
      id: String(Date.now()),
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      durationMinutes: Number(formData.get("duration")),
      price: Number(formData.get("price")),
      isActive: true,
    };

    setServiceList((prev) => [...prev, newService]);
    form.reset();
  }

  return (
    <>
      <section className="page-header-bg">
        <div className="page-container relative py-14 sm:py-16 lg:py-20">
          <AdminNav />
          <Badge variant="primary" className="mb-5">
            Service catalog
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-[#111827] sm:text-5xl">
            Services
          </h1>
          <p className="mt-4 max-w-2xl text-xl leading-relaxed text-muted">
            Manage the services you offer to customers.
          </p>
        </div>
      </section>

      <div className="page-container py-12 sm:py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <Card elevated accent="primary" padding="lg">
              <CardHeader
                title="All Services"
                description={`${serviceList.length} services available`}
                action={
                  <Badge variant="neutral">{serviceList.length} total</Badge>
                }
              />

              <div className="space-y-4">
                {serviceList.map((service) => (
                  <div key={service.id} className="list-card">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-4">
                        <span
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-light to-white text-lg shadow-sm ring-1 ring-primary/10"
                          aria-hidden="true"
                        >
                          ✨
                        </span>
                        <div>
                          <p className="text-lg font-bold text-[#111827]">
                            {service.name}
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-muted">
                            {service.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
                        <span className="inline-flex rounded-xl bg-primary-soft px-4 py-1.5 text-sm font-semibold text-primary ring-1 ring-primary/10">
                          {service.durationMinutes} min
                        </span>
                        <span className="text-xl font-bold text-[#111827]">
                          {service.price === 0 ? "Free" : `$${service.price}`}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card
              elevated
              accent="secondary"
              padding="lg"
              className="lg:sticky lg:top-28"
            >
              <CardHeader
                title="Add New Service"
                description="Create a new service offering."
              />

              <form onSubmit={handleAddService} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2.5 block text-sm font-bold text-[#111827]"
                  >
                    Service Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    placeholder="e.g. Facial Treatment"
                    className="input-field"
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="mb-2.5 block text-sm font-bold text-[#111827]"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows={3}
                    placeholder="Brief description of the service"
                    className="input-field resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="duration"
                      className="mb-2.5 block text-sm font-bold text-[#111827]"
                    >
                      Duration (min)
                    </label>
                    <input
                      type="number"
                      id="duration"
                      name="duration"
                      required
                      min={5}
                      step={5}
                      placeholder="30"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="price"
                      className="mb-2.5 block text-sm font-bold text-[#111827]"
                    >
                      Price ($)
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      required
                      min={0}
                      step={1}
                      placeholder="50"
                      className="input-field"
                    />
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full">
                  + Add Service
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
