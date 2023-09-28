import Corpus from "./Corpus"

export default function Sentences ({ corpus, context, onChangeContext }) {
  return (
    corpus && corpus.length > 0 && (
      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px' }}>
        <div style={{ width: '48%' }}>
          <h2 style={{
            textAlign: 'center', margin: 'auto', fontWeight: 600,
            color: '#2c2c2c'
          }}>Sentences</h2>
          <Corpus sentences={corpus}
            onChange={onChangeContext}
          />
        </div>

        {context.length > 0 && (
          <>
            <div style={{ top: '0', bottom: '0', left: '50%', width: '1px', backgroundColor: '#ccc' }}></div>
            <div style={{ width: '48%' }}>
              <h2 style={{
                textAlign: 'center', margin: 'auto', fontWeight: 600,
                color: '#2c2c2c'
              }}>Context</h2>
              <div className='context-card'>
                {context[0]} <b>{context[1]}</b> {context[2]}
              </div>
            </div>
          </>
        )}
      </div>
    )
  )
}