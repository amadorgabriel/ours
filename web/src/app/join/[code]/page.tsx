import Link from 'next/link';

type JoinPageProps = {
  params: Promise<{ code: string }>;
};

export default async function JoinPage({ params }: JoinPageProps) {
  const { code } = await params;
  const inviteCode = code.trim().toUpperCase();
  const deepLink = `projectours://join/${inviteCode}`;

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center bg-[#FCF8F4] px-6 py-12 text-center">
      <h1 className="text-2xl font-semibold text-[#6B5843]">Você foi convidado ao Ours</h1>
      <p className="mt-3 text-base text-[#6B5843]/80">
        Use o código abaixo para entrar na família no app.
      </p>
      <p className="mt-8 text-4xl font-semibold tracking-[0.2em] text-[#6B5843]">{inviteCode}</p>
      <a
        className="mt-8 inline-flex rounded-xl bg-[#5A6838] px-6 py-3 font-semibold text-[#FCF8F4]"
        href={deepLink}
      >
        Abrir no app
      </a>
      <p className="mt-6 text-sm text-[#6B5843]/70">
        Sem o app instalado? Baixe o Project Ours e cole o código na tela de entrada.
      </p>
      <Link className="mt-4 text-sm font-semibold text-[#2B5F8A]" href="/login">
        Já tenho conta — entrar na web
      </Link>
    </main>
  );
}
