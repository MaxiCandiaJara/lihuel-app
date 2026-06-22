import clsx from 'clsx'

export const Card = ({ children, className, hover = false, onClick }) => (
  <div
    className={clsx(hover ? 'card-hover' : 'card', className)}
    onClick={onClick}
  >
    {children}
  </div>
)

export const CardHeader = ({ children, className }) => (
  <div className={clsx('px-5 pt-5 pb-3', className)}>{children}</div>
)

export const CardBody = ({ children, className }) => (
  <div className={clsx('px-5 py-3', className)}>{children}</div>
)

export const CardFooter = ({ children, className }) => (
  <div className={clsx('px-5 pt-3 pb-5', className)}>{children}</div>
)

export default Card
