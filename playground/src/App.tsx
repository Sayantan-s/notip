import { Notip, useSnackbar, useDialog, MyButton } from '../../src'

function DemoControls() {
  const { show: showToast } = useSnackbar();
  const { show: showDialog } = useDialog();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem', border: '1px solid #333', borderRadius: '12px', marginTop: '2rem', backgroundColor: 'rgba(0,0,0,0.2)' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Notip Controls</h2>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
        <button 
          style={{ backgroundColor: '#2563eb', color: 'white' }}
          onClick={() => showToast({ 
            title: 'Success!', 
            description: 'Action completed successfully.', 
            variant: 'success' 
          })}
        >
          Success Toast
        </button>

        <button 
          style={{ backgroundColor: '#dc2626', color: 'white' }}
          onClick={() => showToast({ 
            title: 'Error Occurred', 
            description: 'Something went wrong.', 
            variant: 'error' 
          })}
        >
          Error Toast
        </button>

        <button 
           style={{ backgroundColor: '#9333ea', color: 'white' }}
           onClick={() => showToast({
             title: 'Top Left',
             description: 'Placement: top-left',
             placement: 'top-left'
           })}
        >
          Top Left
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
        <button 
          style={{ backgroundColor: '#4f46e5', color: 'white' }}
          onClick={() => showDialog({
            title: 'Delete Item?',
            description: 'This action cannot be undone. Are you sure?',
            variant: 'error',
            confirmText: 'Delete',
            onConfirm: () => showToast({ title: 'Deleted', variant: 'info' })
          })}
        >
          Show Dialog
        </button>
      </div>
    </div>
  );
}

export function App() {
  return (
    <div style={{ minHeight: '100vh', padding: '2rem', color: 'rgba(255, 255, 255, 0.87)' }}>
      {/* Notip Provider & Compounds */}
      <Notip>
        <Notip.Snackbar />
        <Notip.Dialog />
      </Notip>
      
      <div style={{ maxWidth: '896px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>Notip Library Demo</h1>
        <p style={{ marginBottom: '2rem', fontSize: '1.125rem', opacity: 0.8 }}>A Singleton Notification System with External Store</p>
        
        <MyButton type="primary" />
        
        <DemoControls />
      </div>
    </div>
  )
}
