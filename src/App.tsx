import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  Blocks,
  BriefcaseBusiness,
  ChevronRight,
  CircleHelp,
  Clock3,
  CreditCard,
  FileClock,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  LockKeyhole,
  Menu,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Your workspace, at a glance.',
  },
  { name: 'Tracker', icon: Clock3, description: 'Focused work starts here.' },
  {
    name: 'Projects',
    icon: FolderKanban,
    description: 'A place for every project.',
  },
  {
    name: 'DTR',
    icon: FileClock,
    description: 'Daily records, clearly accounted for.',
  },
  {
    name: 'Timesheets',
    icon: ListChecks,
    description: 'From recorded time to reviewed work.',
  },
  {
    name: 'Members',
    icon: Users,
    description: 'Your people and their permissions.',
  },
  {
    name: 'Clients',
    icon: BriefcaseBusiness,
    description: 'Build a clear picture of client work.',
  },
  {
    name: 'Billing',
    icon: CreditCard,
    description: 'Approved work, accountable billing.',
  },
  {
    name: 'Login',
    icon: LockKeyhole,
    description: 'Secure access starts with verified identity.',
  },
];
function currentPage() {
  const value = window.location.hash.slice(2).toLowerCase();
  return (
    navigation.find((item) => item.name.toLowerCase() === value)?.name ??
    'Dashboard'
  );
}
export function App() {
  const [page, setPage] = useState(currentPage);
  const [menu, setMenu] = useState(false);
  const [help, setHelp] = useState(false);
  useEffect(() => {
    const change = () => {
      setPage(currentPage());
      setMenu(false);
    };
    window.addEventListener('hashchange', change);
    return () => window.removeEventListener('hashchange', change);
  }, []);
  const selected = navigation.find((item) => item.name === page)!;
  return (
    <div className="app">
      <a className="skip" href="#main">
        Skip to content
      </a>
      <aside
        className={menu ? 'sidebar open' : 'sidebar'}
        aria-label="Workspace navigation"
      >
        <a href="#/dashboard" className="brand">
          <span className="brand-mark">
            h<span>∕</span>
          </span>
          hourvia<span className="version">V2</span>
        </a>
        <div className="workspace">
          <span className="workspace-icon">
            <Blocks size={19} />
          </span>
          <div>
            Workspace foundation<small>No organization connected</small>
          </div>
          <LockKeyhole size={14} />
        </div>
        <p className="nav-label">WORKSPACE</p>
        <nav>
          {navigation.map(({ name, icon: Icon }) => (
            <a
              key={name}
              href={'#/' + name.toLowerCase()}
              aria-current={page === name ? 'page' : undefined}
            >
              <Icon size={18} />
              <span>{name}</span>
              {page === name && <span className="active-dot" />}
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="isolation">
            <ShieldCheck size={19} />
            <div>
              Isolated by design<small>Production services are disabled</small>
            </div>
          </div>
          <button className="help" onClick={() => setHelp(!help)}>
            <CircleHelp size={17} />
            About this foundation
            <ChevronRight size={15} />
          </button>
        </div>
      </aside>
      <div className="content">
        <header>
          <div className="breadcrumb">
            <button
              className="mobile-menu"
              aria-label={menu ? 'Close navigation' : 'Open navigation'}
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X /> : <Menu />}
            </button>
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>{page}</strong>
          </div>
          <span className="environment">
            <span />
            ISOLATED FOUNDATION
          </span>
        </header>
        <main id="main">
          <div className="page-heading">
            <div>
              <p className="eyebrow">MAKE EVERY HOUR COUNT</p>
              <h1>{page === 'Dashboard' ? 'A clear start.' : page}</h1>
              <p>{selected.description}</p>
            </div>
            <span className="sprint">
              SPRINT <b>1.1</b>
            </span>
          </div>
          <div className="notice">
            <ShieldCheck size={19} />
            <div>
              <strong>You’re viewing the application foundation.</strong>
              <span>
                Authentication, tracking and billing are unavailable. No live
                data is connected.
              </span>
            </div>
            <span className="notice-tag">SERVICES OFF</span>
          </div>
          {page === 'Dashboard' ? (
            <>
              <section className="overview" aria-label="Workspace overview">
                <div className="intro-panel">
                  <span className="panel-label">YOUR NEXT CHAPTER</span>
                  <h2>
                    Good work deserves
                    <br />
                    <em>clear records.</em>
                  </h2>
                  <p>
                    Your workspace is taking shape. Explore the foundation while
                    secure access and organization services await
                    implementation.
                  </p>
                  <a href="#/projects">
                    Explore the workspace <ArrowUpRight size={17} />
                  </a>
                  <div className="orbit" aria-hidden="true">
                    <div />
                    <div />
                    <div />
                    <span>h∕</span>
                  </div>
                </div>
                <div className="readiness">
                  <div className="section-title">
                    <h2>Connection status</h2>
                    <span className="tiny-label">ALL DISABLED</span>
                  </div>
                  {[
                    'Identity & access',
                    'Organization data',
                    'Time tracking',
                    'Billing services',
                  ].map((label) => (
                    <div className="status-row" key={label}>
                      <span className="status-dot" />
                      <span>{label}</span>
                      <span>Not connected</span>
                    </div>
                  ))}
                  <p>
                    <LockKeyhole size={14} />
                    No production integrations are enabled.
                  </p>
                </div>
              </section>
              <section className="work-section">
                <div className="section-title">
                  <div>
                    <h2>Built around your work</h2>
                    <p>The essentials, with clear boundaries.</p>
                  </div>
                  <span className="tiny-label">WORKSPACE MODULES</span>
                </div>
                <div className="module-grid">
                  {[
                    {
                      title: 'Track with intention',
                      page: 'Tracker',
                      icon: Clock3,
                      text: 'Project-based time, breaks and explicit resume. Tracking is unavailable.',
                    },
                    {
                      title: 'Review with confidence',
                      page: 'Timesheets',
                      icon: ListChecks,
                      text: 'Daily records and independent review. No hours or approvals exist here.',
                    },
                    {
                      title: 'Bill with clarity',
                      page: 'Billing',
                      icon: CreditCard,
                      text: 'Billing from approved work only. Invoice preparation is unavailable.',
                    },
                  ].map(({ title, page: target, icon: Icon, text }) => (
                    <a
                      className="module-card"
                      href={'#/' + target.toLowerCase()}
                      key={title}
                    >
                      <div className="card-top">
                        <Icon size={23} />
                        <ArrowUpRight size={17} />
                      </div>
                      <h3>{title}</h3>
                      <p>{text}</p>
                      <span>
                        Explore {target.toLowerCase()}{' '}
                        <ChevronRight size={14} />
                      </span>
                    </a>
                  ))}
                </div>
              </section>
              <section className="activity">
                <div>
                  <h2>Workspace activity</h2>
                  <p>
                    Future organization events appear here after verified access
                    is implemented.
                  </p>
                </div>
                <div className="empty-inline">
                  <FileClock size={25} />
                  <div>
                    <strong>No activity available</strong>
                    <p>There is no connected organization or recorded work.</p>
                  </div>
                  <span>AWAITING CONNECTION</span>
                </div>
              </section>
            </>
          ) : (
            <section className="placeholder">
              <selected.icon size={34} strokeWidth={1.4} />
              <span className="tiny-label">
                NOT AVAILABLE IN THIS FOUNDATION
              </span>
              <h2>
                {page === 'Login'
                  ? 'Authentication is not connected.'
                  : page + ' await secure organization access.'}
              </h2>
              <p>
                {page === 'Login'
                  ? 'Login, signup and recovery remain disabled pending the identity audit and an approved integration. Browsing this shell does not create a session.'
                  : 'This area has no live records. Verified identity, active organization membership and server-side permissions are required before data or actions become available.'}
              </p>
              <button disabled>
                {page === 'Tracker'
                  ? 'Start tracking — unavailable'
                  : page === 'Billing'
                    ? 'Prepare invoice — unavailable'
                    : page === 'Login'
                      ? 'Sign in — unavailable'
                      : 'Connect organization — unavailable'}
              </button>
              <a href="#/dashboard">
                Return to dashboard <ArrowUpRight size={15} />
              </a>
            </section>
          )}
          {help && (
            <section className="help-panel" aria-label="About this foundation">
              <h2>Application foundation · Sprint 1.1</h2>
              <p>
                This shell supports navigation only. It does not authenticate
                users, record time, approve timesheets or prepare invoices.
                Monitoring is off. No database, identity or mail provider is
                connected.
              </p>
              <button onClick={() => setHelp(false)}>Close information</button>
            </section>
          )}
          <footer>
            <span>
              HOURVIA <span className="footer-divider">/</span> Intentional
              work. Accountable time.
            </span>
            <span>
              Monitoring off <span className="footer-dot" /> Foundation v0.1
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
