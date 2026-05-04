import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';
import { Editor } from '@monaco-editor/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../context/user';
import { getRequest } from '../api/api-requests';

export default function Binding() {
  const { user } = useUser();
  const ydoc = useMemo(() => new Y.Doc(), [])
  const [token, setToken] = useState(null)
  const [editor , setEditor] = useState(null);
  const [provider, setProvider] = useState<HocuspocusProvider | null>(null)
  const [binding, setBinding] = useState<MonacoBinding | null>(null)
  const { docId } = useParams();
  const navigate = useNavigate()

  // generate access token
  useEffect(() => {
    async function getToken() {
      try {
        const res = await getRequest(`/document/${docId}`)
        setToken(res)
      } catch (error) {
        console.error(error)
        navigate(-1)
      }
    }
    getToken();
  }, [])


  // lifetime for ydoc and provider
  useEffect(() => {
    if (!token) return;
    const provider = new HocuspocusProvider({
      url: 'ws://127.0.0.1:1234',
      name: `document-${docId}`,
      document: ydoc,
      token
    });
    provider.awareness.setLocalStateField('user', {
      name: 'User ' + Math.floor(Math.random() * 100),
      color: 'orange', // Can be used for dynamic coloring
      colorLight: 'rgba(255, 165, 0, 0.2)'
    });
    setProvider(provider);
    return () => {
      provider?.destroy();
      ydoc.destroy()
    }
  }, [ydoc, token])


  // lifetime for editor binding
  useEffect(() => {
    if (provider === null || editor === null) return;

    const binding = new MonacoBinding(ydoc.getText(), editor.getModel(), new Set([editor]), provider.awareness);
    setBinding(binding)
    return () => {
      binding.destroy();
    }
  }, [ydoc, provider, editor])


  return (
    <Editor height="90vh" defaultLanguage='javascript' onMount={editor => { setEditor(editor)}}/>
  )
}