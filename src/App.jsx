import { useEffect, useMemo, useState } from 'react';
import { supabase } from './lib/supabase.js';
import { ArrowRight, Bell, BriefcaseBusiness, Building2, CalendarDays, Heart, MapPin, Menu, Newspaper, Search, ShieldCheck, Store, Users, Wrench, X, Sparkles } from 'lucide-react';

const categories = [
  { name: 'Comércios', icon: Store }, { name: 'Serviços', icon: Wrench },
  { name: 'Empregos', icon: BriefcaseBusiness }, { name: 'Eventos', icon: CalendarDays },
  { name: 'Notícias', icon: Newspaper }, { name: 'Comunidade', icon: Users }
];
const places = [
  { name: 'Mercadinho Central', type: 'Mercado e mercearia', category: 'Comércios', location: 'Centro • São José da Tapera', initials: 'MC', tone: 'green' },
  { name: 'Studio Beleza & Cia', type: 'Beleza e estética', category: 'Serviços', location: 'Centro • São José da Tapera', initials: 'BC', tone: 'pink' },
  { name: 'Oficina do João', type: 'Mecânica automotiva', category: 'Serviços', location: 'Bairro Dez • São José da Tapera', initials: 'OJ', tone: 'blue' },
  { name: 'Papelaria Criativa', type: 'Papelaria e presentes', category: 'Comércios', location: 'Centro • São José da Tapera', initials: 'PC', tone: 'yellow' }
];

export default function App() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todos');
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [user, setUser] = useState(null);
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [resetMode, setResetMode] = useState(false);
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const [databaseBusinesses, setDatabaseBusinesses] = useState([]);
  const [businessesLoading, setBusinessesLoading] = useState(false);
  const [businessesError, setBusinessesError] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminTab, setAdminTab] = useState('overview');
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [adminMessage, setAdminMessage] = useState('');
  const [pendingBusinesses, setPendingBusinesses] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');
  const [postType, setPostType] = useState('news');
  const [postStatus, setPostStatus] = useState('draft');
  const [postSaving, setPostSaving] = useState(false);

  useEffect(() => {
    if (!supabase) return undefined;
    let mounted = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (mounted && !error) setUser(data.session?.user ?? null);
    }).catch(() => {
      if (mounted) setAuthError('Não foi possível verificar a sessão. Confira sua conexão.');
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'PASSWORD_RECOVERY') {
        setModal('login');
        setResetMode(false);
        setPasswordRecovery(true);
        setAuthError('');
        setAuthMessage('Defina uma nova senha para concluir a recuperação da sua conta.');
      }
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase) return undefined;
    let active = true;
    setBusinessesLoading(true);
    supabase
      .from('businesses')
      .select('id, name, category, description, address, neighborhood, municipalities(name, state_code)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setBusinessesError('Não foi possível carregar os estabelecimentos. Confirme se a migration do Supabase foi executada.');
        } else {
          const tones = ['green', 'pink', 'blue', 'yellow'];
          setDatabaseBusinesses((data ?? []).map((item, index) => ({
            id: item.id,
            name: item.name,
            type: item.category,
            category: categories.some(c => c.name === item.category) ? item.category : 'Outros',
            location: [item.neighborhood, item.address, item.municipalities?.name].filter(Boolean).join(' • ') || 'Alagoas',
            initials: item.name.slice(0, 2).toUpperCase(),
            tone: tones[index % tones.length]
          })));
        }
        setBusinessesLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setBusinessesError('Falha de conexão ao consultar o Supabase.');
        setBusinessesLoading(false);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!supabase || !user) {
      setUserRole(null);
      setAdminOpen(false);
      return undefined;
    }
    let active = true;
    supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setUserRole(null);
          setAdminError('Não foi possível verificar suas permissões. Entre novamente ou procure o administrador.');
          return;
        }
        const roles = (data ?? []).map(item => item.role);
        setUserRole(roles.includes('admin') ? 'admin' : roles.includes('editor') ? 'editor' : 'resident');
      })
      .catch(() => {
        if (active) setUserRole(null);
      });
    return () => { active = false; };
  }, [user]);

  const loadAdminData = async () => {
    if (!supabase || !user || !['admin', 'editor'].includes(userRole)) return;
    setAdminLoading(true);
    setAdminError('');
    const [businessResult, postResult, rolesResult, profilesResult] = await Promise.all([
      userRole === 'admin'
        ? supabase.from('businesses')
            .select('id, name, category, description, address, neighborhood, status, created_at')
            .in('status', ['pending', 'rejected'])
            .order('created_at', { ascending: false })
            .limit(100)
        : Promise.resolve({ data: [], error: null }),
      supabase.from('community_posts')
        .select('id, title, body, post_type, status, published_at, created_at')
        .order('created_at', { ascending: false })
        .limit(100),
      userRole === 'admin'
        ? supabase.from('user_roles').select('user_id, role, assigned_at').order('assigned_at', { ascending: false }).limit(200)
        : Promise.resolve({ data: [], error: null }),
      userRole === 'admin'
        ? supabase.from('profiles').select('id, full_name, created_at').order('created_at', { ascending: false }).limit(200)
        : Promise.resolve({ data: [], error: null })
    ]);
    if (businessResult.error || postResult.error || rolesResult.error || profilesResult.error) {
      setAdminError('Alguns dados não puderam ser carregados. Verifique suas permissões de administrador/editor e as políticas do banco.');
    } else {
      setPendingBusinesses(businessResult.data ?? []);
      setCommunityPosts(postResult.data ?? []);
      const roles = rolesResult.data ?? [];
      const profiles = profilesResult.data ?? [];
      setAdminUsers(profiles.map(profile => ({
        ...profile,
        roles: roles.filter(role => role.user_id === profile.id).map(role => role.role)
      })));
    }
    setAdminLoading(false);
  };

  useEffect(() => {
    if (adminOpen) loadAdminData();
  }, [adminOpen, userRole, user]);

  const moderateBusiness = async (businessId, status) => {
    if (!supabase || userRole !== 'admin') return;
    setAdminError('');
    setAdminMessage('');
    const { error } = await supabase.from('businesses').update({ status }).eq('id', businessId);
    if (error) {
      setAdminError('Não foi possível atualizar o estabelecimento. Verifique suas permissões.');
      return;
    }
    setAdminMessage(status === 'approved' ? 'Estabelecimento aprovado.' : 'Estabelecimento recusado.');
    await loadAdminData();
  };

  const saveCommunityPost = async (event) => {
    event.preventDefault();
    if (!supabase || !user || !['admin', 'editor'].includes(userRole)) return;
    if (postTitle.trim().length < 3 || postBody.trim().length < 5) {
      setAdminError('Informe um título e um conteúdo válidos.');
      return;
    }
    setPostSaving(true);
    setAdminError('');
    setAdminMessage('');
    try {
      const { data: municipality, error: municipalityError } = await supabase
        .from('municipalities')
        .select('id')
        .eq('name', 'São José da Tapera')
        .eq('state_code', 'AL')
        .maybeSingle();
      if (municipalityError) throw municipalityError;
      const payload = {
        author_id: user.id,
        municipality_id: municipality?.id ?? null,
        post_type: postType,
        title: postTitle.trim(),
        body: postBody.trim(),
        status: postStatus,
        published_at: postStatus === 'published' ? new Date().toISOString() : null
      };
      const { error } = await supabase.from('community_posts').insert(payload);
      if (error) throw error;
      setPostTitle('');
      setPostBody('');
      setPostType('news');
      setPostStatus('draft');
      setAdminMessage(postStatus === 'published' ? 'Publicação criada e publicada.' : 'Rascunho salvo.');
      await loadAdminData();
    } catch (error) {
      setAdminError(error instanceof Error ? error.message : 'Não foi possível salvar a publicação.');
    } finally {
      setPostSaving(false);
    }
  };

  const changePostStatus = async (postId, status) => {
    if (!supabase || !['admin', 'editor'].includes(userRole)) return;
    setAdminError('');
    const updates = {
      status,
      published_at: status === 'published' ? new Date().toISOString() : null
    };
    const { error } = await supabase.from('community_posts').update(updates).eq('id', postId);
    if (error) {
      setAdminError('Não foi possível alterar o status desta publicação.');
      return;
    }
    setAdminMessage(status === 'published' ? 'Publicação publicada.' : status === 'archived' ? 'Publicação arquivada.' : 'Publicação salva como rascunho.');
    await loadAdminData();
  };

  const deletePost = async (postId) => {
    if (!supabase || !['admin', 'editor'].includes(userRole)) return;
    if (!window.confirm('Tem certeza de que deseja excluir esta publicação?')) return;
    setAdminError('');
    const { error } = await supabase.from('community_posts').delete().eq('id', postId);
    if (error) {
      setAdminError('Não foi possível excluir esta publicação.');
      return;
    }
    setAdminMessage('Publicação excluída.');
    await loadAdminData();
  };

  const openAuth = (mode) => {
    setModal(mode);
    setResetMode(false);
    setPasswordRecovery(false);
    setAuthError('');
    setAuthMessage('');
    setAuthPassword('');
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthError('');
    setAuthMessage('');
    if (!supabase) {
      setAuthError('A conexão com o Supabase ainda não foi configurada. Siga o guia em supabase/README.md.');
      return;
    }
    if (!authEmail.trim()) {
      setAuthError('Informe seu e-mail.');
      return;
    }
    if (!resetMode && authPassword.length < 8) {
      setAuthError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (modal === 'register' && !resetMode && !authName.trim()) {
      setAuthError('Informe seu nome completo.');
      return;
    }

    setAuthBusy(true);
    try {
      if (resetMode) {
        const { error } = await supabase.auth.resetPasswordForEmail(authEmail.trim(), {
          redirectTo: window.location.origin
        });
        if (error) setAuthError(error.message);
        else setAuthMessage('Se o e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha.');
        return;
      }

      if (passwordRecovery) {
        const { error } = await supabase.auth.updateUser({ password: authPassword });
        if (error) setAuthError(error.message);
        else {
          setPasswordRecovery(false);
          setModal('');
          setAuthPassword('');
        }
        return;
      }

      const result = modal === 'register'
        ? await supabase.auth.signUp({
            email: authEmail.trim(),
            password: authPassword,
            options: {
              data: { full_name: authName.trim() },
              emailRedirectTo: window.location.origin
            }
          })
        : await supabase.auth.signInWithPassword({
            email: authEmail.trim(),
            password: authPassword
          });

      if (result.error) {
        setAuthError(result.error.message);
        return;
      }
      if (result.data.session) {
        setModal('');
        setAuthPassword('');
      } else {
        setAuthMessage('Cadastro recebido. Verifique seu e-mail para confirmar a conta antes de entrar.');
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Não foi possível concluir a solicitação. Tente novamente.');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    try {
      const { error } = await supabase.auth.signOut();
      if (error) setAuthError(error.message);
      else setUser(null);
    } catch {
      setAuthError('Não foi possível encerrar a sessão. Tente novamente.');
    }
  };
  const sourcePlaces = supabase ? databaseBusinesses : places;
  const results = useMemo(() => sourcePlaces.filter(p =>
    (category === 'Todos' || p.category === category) &&
    (p.name + ' ' + p.type + ' ' + p.location).toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'))
  ), [query, category, sourcePlaces]);
  const toggleFavorite = name => setFavorites(old => old.includes(name) ? old.filter(x => x !== name) : [...old, name]);

  return <div className="app">
    <header className="topbar">
      <a className="brand" href="#"><span className="brand-mark"><i/><i/><i/></span><span><b>conecta<span>tapera</span></b><small>SUA CIDADE, MAIS PERTO.</small></span></a>
      <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">{menuOpen ? <X/> : <Menu/>}</button>
      <nav className={menuOpen ? 'nav open' : 'nav'}>{[['Explorar','#explorar'],['Categorias','#categorias'],['Comunidade','#comunidade'],['Sobre','#sobre']].map(([t,h])=><a key={t} href={h} onClick={()=>setMenuOpen(false)}>{t}</a>)}</nav>
      <div className="actions"><button className="bell" aria-label="Notificações"><Bell size={19}/></button>{user ? <>{['admin','editor'].includes(userRole) && <button className="admin-link" onClick={()=>{setAdminOpen(!adminOpen);setMenuOpen(false);}}>{adminOpen?'Voltar ao site':'Painel'}</button>}<span className="signed-user">{user.user_metadata?.full_name || user.email}</span><button className="login" onClick={handleSignOut}>Sair</button></> : <><button className="login" onClick={()=>openAuth('login')}>Entrar</button><button className="primary compact" onClick={()=>openAuth('register')}>Criar conta <ArrowRight size={15}/></button></>}</div>
    </header>

    {adminOpen ? <main className="admin-shell">
      <section className="admin-hero">
        <div><span className="eyebrow"><ShieldCheck size={15}/> ÁREA RESTRITA</span><h1>Painel de <em>gestão.</em></h1><p>Gerencie os estabelecimentos e as publicações da comunidade.</p></div>
        <span className="admin-role">{userRole==='admin'?'Administrador':'Editor'}</span>
      </section>
      <section className="admin-content">
        <div className="admin-tabs">
          <button className={adminTab==='overview'?'selected':''} onClick={()=>setAdminTab('overview')}>Visão geral</button>
          {userRole==='admin' && <button className={adminTab==='businesses'?'selected':''} onClick={()=>setAdminTab('businesses')}>Estabelecimentos</button>}
          <button className={adminTab==='content'?'selected':''} onClick={()=>setAdminTab('content')}>Publicações</button>
          {userRole==='admin' && <button className={adminTab==='users'?'selected':''} onClick={()=>setAdminTab('users')}>Usuários</button>}
        </div>
        {adminError && <p className="admin-alert error" role="alert">{adminError}</p>}
        {adminMessage && <p className="admin-alert success" role="status">{adminMessage}</p>}
        {adminLoading ? <div className="admin-loading">Carregando dados do painel...</div> : <>
          {adminTab==='overview' && <div className="admin-overview">
            <div className="admin-stats">
              <article><span>Estabelecimentos pendentes</span><strong>{pendingBusinesses.filter(b=>b.status==='pending').length}</strong></article>
              <article><span>Publicações</span><strong>{communityPosts.length}</strong></article>
              <article><span>Usuários cadastrados</span><strong>{userRole==='admin'?adminUsers.length:'—'}</strong></article>
            </div>
            <div className="admin-panel-card"><h2>Atalhos de gestão</h2><div className="admin-actions-grid">
              {userRole==='admin' && <button onClick={()=>setAdminTab('businesses')}><Building2/>Analisar cadastros de empresas</button>}
              <button onClick={()=>setAdminTab('content')}><Newspaper/>Criar notícia ou evento</button>
              {userRole==='admin' && <button onClick={()=>setAdminTab('users')}><Users/>Consultar usuários e perfis</button>}
            </div></div>
          </div>}
          {adminTab==='businesses' && userRole==='admin' && <div className="admin-panel-card">
            <div className="admin-section-head"><div><h2>Estabelecimentos para análise</h2><p>Aprove ou recuse cadastros enviados pelos proprietários.</p></div><button className="admin-refresh" onClick={loadAdminData}>Atualizar</button></div>
            {pendingBusinesses.length===0 ? <p className="admin-empty">Nenhum cadastro pendente ou recusado neste momento.</p> : <div className="admin-list">
              {pendingBusinesses.map(b=><article className="admin-row" key={b.id}><div className="admin-row-main"><strong>{b.name}</strong><span>{b.category} · {b.neighborhood || b.address || 'São José da Tapera'}</span><small>{b.status==='pending'?'Aguardando análise':'Recusado anteriormente'}</small></div><div className="admin-row-actions"><button className="approve" onClick={()=>moderateBusiness(b.id,'approved')}>Aprovar</button><button className="reject" onClick={()=>moderateBusiness(b.id,'rejected')}>Recusar</button></div></article>)}
            </div>}
          </div>}
          {adminTab==='content' && <div className="admin-content-grid">
            <form className="admin-panel-card admin-form" onSubmit={saveCommunityPost}>
              <h2>Nova publicação</h2>
              <label>Título<input value={postTitle} onChange={e=>setPostTitle(e.target.value)} required minLength={3} maxLength={180} placeholder="Ex.: Mutirão comunitário no sábado"/></label>
              <label>Tipo<select value={postType} onChange={e=>setPostType(e.target.value)}><option value="news">Notícia</option><option value="event">Evento</option><option value="announcement">Comunicado</option></select></label>
              <label>Conteúdo<textarea value={postBody} onChange={e=>setPostBody(e.target.value)} required minLength={5} rows={5} placeholder="Escreva as informações da publicação..."/></label>
              <label>Publicação<select value={postStatus} onChange={e=>setPostStatus(e.target.value)}><option value="draft">Salvar como rascunho</option><option value="published">Publicar agora</option></select></label>
              <button className="primary" disabled={postSaving}>{postSaving?'Salvando...':'Salvar publicação'}</button>
            </form>
            <div className="admin-panel-card"><div className="admin-section-head"><div><h2>Conteúdo recente</h2><p>Notícias, eventos e comunicados registrados no banco.</p></div><button className="admin-refresh" onClick={loadAdminData}>Atualizar</button></div>
              {communityPosts.length===0 ? <p className="admin-empty">Nenhuma publicação cadastrada.</p> : <div className="admin-list">
                {communityPosts.map(p=><article className="admin-row" key={p.id}><div className="admin-row-main"><strong>{p.title}</strong><span>{p.post_type==='event'?'Evento':p.post_type==='announcement'?'Comunicado':'Notícia'} · {p.status==='published'?'Publicado':p.status==='archived'?'Arquivado':'Rascunho'}</span><small>{new Date(p.created_at).toLocaleDateString('pt-BR')}</small></div><div className="admin-row-actions">{p.status==='published'?<button className="admin-secondary" onClick={()=>changePostStatus(p.id,'draft')}>Rascunho</button>:<button className="approve" onClick={()=>changePostStatus(p.id,'published')}>Publicar</button>}<button className="reject" onClick={()=>deletePost(p.id)}>Excluir</button></div></article>)}
              </div>}
            </div>
          </div>}
          {adminTab==='users' && userRole==='admin' && <div className="admin-panel-card">
            <div className="admin-section-head"><div><h2>Usuários e permissões</h2><p>Contas registradas e seus papéis de acesso.</p></div><button className="admin-refresh" onClick={loadAdminData}>Atualizar</button></div>
            {adminUsers.length===0 ? <p className="admin-empty">Ainda não há contas cadastradas.</p> : <div className="admin-list">
              {adminUsers.map(person=><article className="admin-row" key={person.id}><div className="admin-row-main"><strong>{person.full_name || 'Morador sem nome informado'}</strong><span>ID da conta: {person.id}</span><small>Papel: {person.roles.length?person.roles.join(', '):'sem papel atribuído'}</small></div></article>)}
            </div>}
            <p className="admin-footnote">A alteração de papéis administrativos exige uma ação controlada pelo responsável do projeto. Novas contas recebem automaticamente o papel de morador.</p>
          </div>}
        </>}
      </section>
    </main> : <main>
      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow"><Sparkles size={15}/> A CONEXÃO QUE A NOSSA TERRA MERECE</span>
          <h1>Sua cidade conectada.<br/><em>Sua comunidade</em> mais forte.</h1>
          <p>Encontre comércios, serviços, oportunidades e tudo o que movimenta São José da Tapera e região.</p>
          <form className="search" onSubmit={e=>{e.preventDefault();document.querySelector('#explorar')?.scrollIntoView({behavior:'smooth'});}}>
            <Search size={20}/><input value={query} onChange={e=>{setQuery(e.target.value);setCategory('Todos');}} placeholder="O que você está procurando hoje?" aria-label="Buscar"/><button className="primary">Buscar <ArrowRight size={16}/></button>
          </form>
          <div className="hero-meta"><span><MapPin size={15}/> São José da Tapera, Alagoas</span><i/> Conectando toda a região</div>
        </div>
        <div className="hero-art" aria-hidden="true"><div className="sun"/><div className="hills"/><div className="town"><i/><i/><i/></div><div className="road"/><div className="float f1"><Store size={17}/> Comércio local</div><div className="float f2"><Users size={17}/> Gente conectada</div></div>
        <div className="hero-foot"><span>FEITO PARA A NOSSA GENTE</span><i/><span>ALAGOAS · BRASIL</span></div>
      </section>

      <section className="trust">
        {[[Building2,'Negócios locais','Valorize quem é daqui'],[Users,'Comunidade unida','Mais perto de todos'],[BriefcaseBusiness,'Novas oportunidades','Trabalho e crescimento'],[ShieldCheck,'Espaço confiável','Informação com cuidado']].map(([Icon,title,desc])=><div key={title}><span><Icon size={20}/></span><p><b>{title}</b><small>{desc}</small></p></div>)}
      </section>

      <section className="section" id="categorias">
        <div className="heading"><div><label>EXPLORE A REGIÃO</label><h2>O que você precisa,<br/><em>está por aqui.</em></h2></div><a className="text-link" href="#explorar">Ver tudo <ArrowRight size={16}/></a></div>
        <div className="categories">{categories.map(({name,icon:Icon},i)=><button key={name} onClick={()=>{setCategory(name);document.querySelector('#explorar')?.scrollIntoView({behavior:'smooth'});}}><span className={'cat-icon c'+i}><Icon size={21}/></span><b>{name}</b><ArrowRight className="cat-arrow" size={16}/></button>)}</div>
      </section>

      <section className="section discover" id="explorar">
        <div className="heading"><div><label>DESCUBRA PERTO DE VOCÊ</label><h2>Conheça quem faz<br/><em>a cidade acontecer.</em></h2></div><button className="reset" onClick={()=>setCategory('Todos')}>{category==='Todos'?'Todas as categorias':category}⌄</button></div>
        <div className="filters"><button className={category==='Todos'?'active':''} onClick={()=>setCategory('Todos')}>Todos</button>{categories.slice(0,2).map(c=><button className={category===c.name?'active':''} key={c.name} onClick={()=>setCategory(c.name)}>{c.name}</button>)}</div>
        {results.length ? <div className="cards">{results.map(p=><article className="place-card" key={p.id || p.name}><div className={'cover '+p.tone}><span className="tag">Destaque local</span><button aria-label="Favoritar" className={favorites.includes(p.name)?'favorite selected':'favorite'} onClick={()=>toggleFavorite(p.name)}><Heart size={18} fill={favorites.includes(p.name)?'currentColor':'none'}/></button><b>{p.initials}</b></div><div className="place-info"><small>{p.type}</small><h3>{p.name}</h3><p><MapPin size={13}/>{p.location}</p><button className="detail" onClick={()=>openAuth('login')}>Ver detalhes <ArrowRight size={15}/></button></div></article>)}</div> : <div className="empty"><Search/><b>Nenhum resultado encontrado</b><span>Tente outro termo ou escolha uma categoria diferente.</span><button onClick={()=>{setQuery('');setCategory('Todos');}}>Limpar busca</button></div>}
        <p className="demo">{!supabase ? 'Prévia com estabelecimentos ilustrativos. Os dados de demonstração não representam cadastros reais.' : businessesLoading ? 'Carregando estabelecimentos aprovados...' : businessesError || (databaseBusinesses.length ? 'Estabelecimentos cadastrados e aprovados na plataforma.' : 'Ainda não há estabelecimentos aprovados para exibir nesta região.')}</p>
      </section>

      <section className="community" id="comunidade"><span className="community-icon"><Users size={29}/></span><div><label>A CIDADE É FEITA POR VOCÊ</label><h2>Tem um negócio ou serviço?<br/><em>Seu lugar é aqui.</em></h2><p>Faça parte da rede que fortalece a economia e aproxima as pessoas da nossa região.</p></div><button onClick={()=>openAuth('register')}>Quero participar <ArrowRight size={16}/></button></section>

      <section className="section news"><div className="heading"><div><label>FIQUE POR DENTRO</label><h2>O que acontece<br/><em>na nossa comunidade.</em></h2></div></div><div className="news-grid">{[[Newspaper,'COMUNIDADE','Fique por dentro do que acontece na sua cidade','Acompanhe comunicados, iniciativas e novidades da região em um só lugar.'],[CalendarDays,'AGENDA','Eventos e encontros da comunidade','Descubra atividades, ações sociais e eventos próximos de você.']].map(([Icon,label,title,desc])=><article key={label}><span><Icon size={22}/></span><label>{label}</label><h3>{title}</h3><p>{desc}</p><a href="#comunidade">Saiba mais <ArrowRight size={15}/></a></article>)}</div></section>
    </main>}

    <footer id="sobre"><div className="footer-grid"><div><a className="brand foot-brand" href="#"><span className="brand-mark"><i/><i/><i/></span><span><b>conecta<span>tapera</span></b><small>SUA CIDADE, MAIS PERTO.</small></span></a><p>Sua cidade conectada.<br/>Sua comunidade mais forte.</p></div>{[['Explore','Comércios','Serviços','Oportunidades'],['Comunidade','Cadastre seu negócio','Divulgue um evento','Fale conosco'],['Plataforma','Sobre o projeto','Privacidade','Termos de uso']].map(([h,...links])=><div className="foot-col" key={h}><b>{h}</b>{links.map(t=><a key={t} href="#sobre">{t}</a>)}</div>)}</div><div className="copyright"><span>© 2026 Conecta Tapera. Projeto em desenvolvimento.</span><span>Feito para São José da Tapera e região ♥</span></div></footer>

    {modal && <div className="backdrop" onClick={()=>setModal('')}><div className="modal" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setModal('')} aria-label="Fechar"><X/></button><span className="brand-mark"><i/><i/><i/></span><label>CONECTA TAPERA</label><h2>{resetMode || passwordRecovery ? 'Recuperar acesso' : modal==='login'?'Que bom ter você de volta.':'Vamos conectar você à cidade.'}</h2><p>{passwordRecovery?'Escolha uma nova senha para proteger sua conta.':resetMode?'Informe o e-mail da sua conta para receber as instruções de recuperação.':modal==='login'?'Entre para acessar sua conta da comunidade.':'Crie sua conta de morador para começar a participar da comunidade.'}</p>
      {!supabase ? <div className="notice"><ShieldCheck size={19}/>A autenticação está pronta no código, mas falta configurar as chaves do seu projeto Supabase. Consulte supabase/README.md.</div> : <form className="auth-form" onSubmit={handleAuthSubmit}>
        {modal==='register' && !resetMode && <label className="field-label">Nome completo<input autoComplete="name" value={authName} onChange={e=>setAuthName(e.target.value)} required placeholder="Seu nome"/></label>}
        <label className="field-label">E-mail<input type="email" autoComplete="email" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} required placeholder="voce@exemplo.com"/></label>
        {!resetMode && <label className="field-label">{passwordRecovery?'Nova senha':'Senha'}<input type="password" autoComplete={modal==='login'?'current-password':'new-password'} value={authPassword} onChange={e=>setAuthPassword(e.target.value)} minLength={8} required placeholder="Mínimo de 8 caracteres"/></label>}
        {authError && <p className="auth-error" role="alert">{authError}</p>}
        {authMessage && <p className="auth-message" role="status">{authMessage}</p>}
        <button className="primary full" disabled={authBusy}>{authBusy?'Aguarde...':resetMode?'Enviar instruções':passwordRecovery?'Salvar nova senha':modal==='login'?'Entrar':'Criar minha conta'}</button>
        {modal==='login' && !resetMode && !passwordRecovery && <button type="button" className="auth-switch" onClick={()=>{setResetMode(true);setPasswordRecovery(false);setAuthError('');setAuthMessage('');}}>Esqueci minha senha</button>}
        {!passwordRecovery && <button type="button" className="auth-switch" onClick={()=>{setResetMode(false);setPasswordRecovery(false);setAuthError('');setAuthMessage('');setModal(modal==='login'?'register':'login');}}>{modal==='login'?'Ainda não tem conta? Criar cadastro':'Já tem uma conta? Entrar'}</button>}
      </form>}
      <p className="privacy-note">Sua senha é gerenciada pelo Supabase Auth. Nunca compartilhe sua senha com ninguém.</p></div></div>}
  </div>;
}
