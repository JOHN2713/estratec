-- Biblioteca de medios: las imágenes se convierten a WebP al subirlas y se
-- almacenan en la base de datos (Vercel tiene disco de solo lectura).
CREATE TABLE "MediaFile" (
  "id"           TEXT         NOT NULL,
  "filename"     VARCHAR(200) NOT NULL,
  "mimeType"     VARCHAR(60)  NOT NULL,
  "width"        INTEGER      NOT NULL,
  "height"       INTEGER      NOT NULL,
  "size"         INTEGER      NOT NULL,
  "data"         BYTEA        NOT NULL,
  "alt"          VARCHAR(200),
  "uploadedById" TEXT,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "MediaFile_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MediaFile_createdAt_idx" ON "MediaFile"("createdAt");

ALTER TABLE "MediaFile"
  ADD CONSTRAINT "MediaFile_uploadedById_fkey"
  FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Coherente con 0002_enable_rls: RLS activo sin políticas bloquea la API REST de Supabase;
-- Prisma (rol postgres) omite RLS y sigue funcionando.
ALTER TABLE public."MediaFile" ENABLE ROW LEVEL SECURITY;
