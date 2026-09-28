/**
 * Prisma Seed File - CMS Kampung
 * Menjalankan: npm run db:seed
 */

import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Mulai seeding database...')

  // ============================================================
  // 1. BUAT SUPER ADMIN
  // ============================================================
  const hashedPassword = await bcrypt.hash('admin123', 12)

  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@cmskampung.id' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'superadmin@cmskampung.id',
      password: hashedPassword,
      role: UserRole.super_admin,
      isActive: true,
    },
  })
  console.log('✅ Super Admin dibuat:', superAdmin.email)

  // Buat Admin Kampung
  const adminKampung = await prisma.user.upsert({
    where: { email: 'admin@cmskampung.id' },
    update: {},
    create: {
      name: 'Admin Kampung',
      email: 'admin@cmskampung.id',
      password: hashedPassword,
      role: UserRole.admin,
      isActive: true,
    },
  })
  console.log('✅ Admin Kampung dibuat:', adminKampung.email)

  // ============================================================
  // 2. VILLAGE INFO
  // ============================================================
  const existingVillage = await prisma.villageInfo.findFirst()
  if (!existingVillage) {
    await prisma.villageInfo.create({
      data: {
        name: 'Kampung Sejahtera',
        tagline: 'Bersatu, Maju, Sejahtera',
        description:
          'Kampung Sejahtera adalah sebuah kampung yang terletak di kaki Gunung Arjuno, Jawa Timur. Dengan kekayaan alam dan budaya yang melimpah, kampung ini terus berkembang dan berinovasi untuk meningkatkan kesejahteraan warganya.',
        address: 'Jl. Raya Kampung Sejahtera No. 1, Kecamatan Makmur, Kabupaten Sejahtera, Jawa Timur 65123',
        phone: '08123456789',
        email: 'info@kampungsejahtera.desa.id',
        socialMedia: {
          instagram: 'https://instagram.com/kampungsejahtera',
          facebook: 'https://facebook.com/kampungsejahtera',
          youtube: '',
        },
        statistics: {
          population: 2450,
          households: 612,
          area_km2: 8.5,
          rw: 5,
          rt: 20,
        },
      },
    })
    console.log('✅ Info kampung dibuat')
  }

  // ============================================================
  // 3. CATEGORIES
  // ============================================================
  const categoriesData = [
    // News categories
    { name: 'Berita Desa', slug: 'berita-desa', type: 'news' as const },
    { name: 'Pengumuman', slug: 'pengumuman', type: 'news' as const },
    { name: 'Kegiatan', slug: 'kegiatan', type: 'news' as const },
    { name: 'Pembangunan', slug: 'pembangunan', type: 'news' as const },
    // UMKM categories
    { name: 'Kuliner', slug: 'kuliner', type: 'umkm' as const },
    { name: 'Kerajinan', slug: 'kerajinan', type: 'umkm' as const },
    { name: 'Pertanian', slug: 'pertanian', type: 'umkm' as const },
    { name: 'Jasa', slug: 'jasa', type: 'umkm' as const },
    { name: 'Fashion', slug: 'fashion', type: 'umkm' as const },
    // Gallery categories
    { name: 'Kegiatan Desa', slug: 'kegiatan-desa', type: 'gallery' as const },
    { name: 'Wisata', slug: 'wisata', type: 'gallery' as const },
    { name: 'Budaya', slug: 'budaya', type: 'gallery' as const },
  ]

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }
  console.log('✅ Kategori dibuat:', categoriesData.length, 'kategori')

  // ============================================================
  // 4. SETTINGS
  // ============================================================
  const settingsData = [
    { key: 'maintenance_mode', value: 'false', type: 'boolean', description: 'Aktifkan mode maintenance website' },
    { key: 'contact_email', value: 'info@kampungsejahtera.desa.id', type: 'string', description: 'Email kontak utama' },
    { key: 'contact_phone', value: '08123456789', type: 'string', description: 'Nomor telepon kontak' },
    { key: 'news_per_page', value: '10', type: 'number', description: 'Jumlah berita per halaman' },
    { key: 'umkm_per_page', value: '12', type: 'number', description: 'Jumlah UMKM per halaman' },
    { key: 'gallery_per_page', value: '16', type: 'number', description: 'Jumlah foto galeri per halaman' },
    { key: 'hero_title', value: 'Selamat Datang di Kampung Sejahtera', type: 'string', description: 'Judul hero di beranda' },
    { key: 'hero_subtitle', value: 'Bersatu, Maju, dan Sejahtera Bersama', type: 'string', description: 'Subtitle hero di beranda' },
  ]

  for (const setting of settingsData) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    })
  }
  console.log('✅ Settings dibuat:', settingsData.length, 'pengaturan')

  // ============================================================
  // 5. CONTOH DATA BERITA
  // ============================================================
  const catBeritaDesa = await prisma.category.findUnique({ where: { slug: 'berita-desa' } })
  const catPengumuman = await prisma.category.findUnique({ where: { slug: 'pengumuman' } })

  const newsData = [
    {
      title: 'Pembangunan Jalan Desa Dimulai Bulan Ini',
      slug: 'pembangunan-jalan-desa-dimulai-bulan-ini',
      content: '<p>Proyek pembangunan jalan desa sepanjang 2 kilometer resmi dimulai bulan ini. Pembangunan ini merupakan hasil dari musyawarah desa yang telah disepakati bersama seluruh warga.</p><p>Kepala Desa menyampaikan bahwa proyek ini akan selesai dalam waktu tiga bulan ke depan dan diharapkan dapat memperlancar akses warga terutama para petani yang membawa hasil panen.</p>',
      excerpt: 'Proyek pembangunan jalan desa sepanjang 2 kilometer resmi dimulai bulan ini.',
      status: 'published' as const,
      isPinned: false,
      categoryId: catBeritaDesa?.id,
      authorId: adminKampung.id,
      publishedAt: new Date(),
    },
    {
      title: 'Pengumuman: Posyandu Rutin Bulan Ini',
      slug: 'pengumuman-posyandu-rutin-bulan-ini',
      content: '<p>Diberitahukan kepada seluruh warga bahwa kegiatan Posyandu rutin akan dilaksanakan pada hari Sabtu, pukul 08.00 - 12.00 WIB di Balai Desa.</p><p>Kegiatan ini meliputi pemeriksaan kesehatan balita, ibu hamil, dan lansia. Harap membawa buku KIA dan KTP.</p>',
      excerpt: 'Posyandu rutin dilaksanakan hari Sabtu, pukul 08.00 WIB di Balai Desa.',
      status: 'published' as const,
      isPinned: true,
      categoryId: catPengumuman?.id,
      authorId: adminKampung.id,
      publishedAt: new Date(),
    },
    {
      title: 'Festival Panen Raya Kampung Sejahtera',
      slug: 'festival-panen-raya-kampung-sejahtera',
      content: '<p>Kampung Sejahtera kembali mengadakan Festival Panen Raya yang merupakan tradisi tahunan untuk mensyukuri hasil bumi. Festival ini akan dimeriahkan dengan berbagai pertunjukan seni budaya lokal, pameran produk UMKM, dan lomba-lomba tradisional.</p>',
      excerpt: 'Festival Panen Raya tahunan kembali hadir dengan berbagai pertunjukan budaya dan pameran UMKM.',
      status: 'published' as const,
      isPinned: false,
      categoryId: catBeritaDesa?.id,
      authorId: adminKampung.id,
      publishedAt: new Date(),
    },
  ]

  for (const news of newsData) {
    await prisma.news.upsert({
      where: { slug: news.slug },
      update: {},
      create: news,
    })
  }
  console.log('✅ Berita contoh dibuat:', newsData.length, 'berita')

  // ============================================================
  // 6. CONTOH DATA UMKM
  // ============================================================
  const catKuliner = await prisma.category.findUnique({ where: { slug: 'kuliner' } })
  const catKerajinan = await prisma.category.findUnique({ where: { slug: 'kerajinan' } })
  const catPertanian = await prisma.category.findUnique({ where: { slug: 'pertanian' } })

  const umkmData = [
    {
      businessName: 'Warung Bu Sari',
      ownerName: 'Sari Wulandari',
      slug: 'warung-bu-sari',
      description: 'Warung makan dengan menu masakan Jawa tradisional. Terkenal dengan rawon dan soto ayam kampung yang lezat menggunakan resep turun-temurun.',
      whatsapp: '628123456001',
      address: 'RT 03/RW 01, Kampung Sejahtera',
      mapsLink: 'https://maps.google.com/?q=-7.5,112.5',
      categoryId: catKuliner?.id,
      isActive: true,
      isFeatured: true,
      authorId: adminKampung.id,
    },
    {
      businessName: 'Kerajinan Anyaman Pak Budi',
      ownerName: 'Budi Santoso',
      slug: 'kerajinan-anyaman-pak-budi',
      description: 'Pengrajin anyaman bambu dan rotan dengan pengalaman 20 tahun. Memproduksi berbagai produk seperti tas, keranjang, tikar, dan hiasan dinding dengan motif khas Jawa Timur.',
      whatsapp: '628123456002',
      address: 'RT 05/RW 02, Kampung Sejahtera',
      mapsLink: 'https://maps.google.com/?q=-7.51,112.51',
      categoryId: catKerajinan?.id,
      isActive: true,
      isFeatured: true,
      authorId: adminKampung.id,
    },
    {
      businessName: 'Sayur Organik Mbak Dewi',
      ownerName: 'Dewi Rahayu',
      slug: 'sayur-organik-mbak-dewi',
      description: 'Menjual berbagai sayuran organik segar langsung dari kebun. Bebas pestisida kimia, ditanam dengan metode pertanian organik bersertifikat. Tersedia bayam, kangkung, tomat, cabai, dan berbagai sayuran lainnya.',
      whatsapp: '628123456003',
      address: 'RT 01/RW 03, Kampung Sejahtera',
      mapsLink: 'https://maps.google.com/?q=-7.52,112.52',
      categoryId: catPertanian?.id,
      isActive: true,
      isFeatured: false,
      authorId: adminKampung.id,
    },
  ]

  for (const umkm of umkmData) {
    await prisma.umkm.upsert({
      where: { slug: umkm.slug },
      update: {},
      create: umkm,
    })
  }
  console.log('✅ UMKM contoh dibuat:', umkmData.length, 'UMKM')

  // ============================================================
  // 7. CONTOH DATA GALERI
  // ============================================================
  const catKegiatanDesa = await prisma.category.findUnique({ where: { slug: 'kegiatan-desa' } })

  const galleryData = [
    {
      title: 'Gotong Royong Bersih Desa',
      description: 'Kegiatan gotong royong membersihkan lingkungan desa yang diikuti oleh seluruh warga.',
      imageUrl: 'https://placehold.co/800x600/22c55e/white?text=Gotong+Royong',
      isPublished: true,
      categoryId: catKegiatanDesa?.id,
      authorId: adminKampung.id,
    },
    {
      title: 'Peringatan HUT RI ke-79',
      description: 'Perayaan kemerdekaan Indonesia dengan berbagai lomba dan kegiatan seru untuk warga.',
      imageUrl: 'https://placehold.co/800x600/dc2626/white?text=HUT+RI',
      isPublished: true,
      categoryId: catKegiatanDesa?.id,
      authorId: adminKampung.id,
    },
    {
      title: 'Musyawarah Desa Tahunan',
      description: 'Musyawarah desa untuk membahas rencana pembangunan dan program kerja tahun depan.',
      imageUrl: 'https://placehold.co/800x600/2563eb/white?text=Musyawarah+Desa',
      isPublished: true,
      categoryId: catKegiatanDesa?.id,
      authorId: adminKampung.id,
    },
    {
      title: 'Panen Raya Padi',
      description: 'Panen raya padi yang berlimpah sebagai hasil kerja keras para petani desa.',
      imageUrl: 'https://placehold.co/800x600/ca8a04/white?text=Panen+Raya',
      isPublished: true,
      categoryId: catKegiatanDesa?.id,
      authorId: adminKampung.id,
    },
    {
      title: 'Kegiatan Posyandu',
      description: 'Pemeriksaan kesehatan rutin balita dan ibu hamil di Posyandu desa.',
      imageUrl: 'https://placehold.co/800x600/db2777/white?text=Posyandu',
      isPublished: true,
      categoryId: catKegiatanDesa?.id,
      authorId: adminKampung.id,
    },
    {
      title: 'Pelatihan Digital UMKM',
      description: 'Pelatihan penggunaan media sosial dan marketplace untuk pelaku UMKM desa.',
      imageUrl: 'https://placehold.co/800x600/7c3aed/white?text=Pelatihan+UMKM',
      isPublished: true,
      categoryId: catKegiatanDesa?.id,
      authorId: adminKampung.id,
    },
  ]

  for (const gallery of galleryData) {
    await prisma.gallery.create({ data: gallery })
  }
  console.log('✅ Galeri contoh dibuat:', galleryData.length, 'foto')

  console.log('\n🎉 Seeding selesai!')
  console.log('─────────────────────────────────────────')
  console.log('📧 Super Admin  : superadmin@cmskampung.id')
  console.log('📧 Admin        : admin@cmskampung.id')
  console.log('🔑 Password     : admin123')
  console.log('─────────────────────────────────────────')
  console.log('⚠️  Harap ganti password setelah login pertama!')
}

main()
  .catch((e) => {
    console.error('❌ Error saat seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
